<%@ WebHandler Language="C#" Class="projectManage" %>

using System;
using System.Web;
using System.Data;
using System.Text;
using System.Data.SqlClient;
using System.IO;
using System.Web.SessionState;

public class projectManage : IHttpHandler, IReadOnlySessionState
{
    //接口函数实现
    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        Account account = (Account)HttpContext.Current.Session["account"];
        if (account == null)
        {
            context.Response.Write("当前为无登录状态");
        }
        //获取操作类型
        string submitData = context.Request.Form["submitData"] == "null" ? "null;" : context.Request.Form["submitData"];
        HttpFileCollection files = context.Request.Files;
        string option = files.Count > 0 ? "UPLOAD_PROJECT" : submitData.Split(';')[0];
        string result = "";
        switch (option)
        {
            case "LOAD_LIST":
                result = loadList(submitData, account);
                break;
            case "LOAD_INFO":
                result = loadInfo(submitData);
                break;
            case "DELETE":
                result = delete(submitData);
                break;
            case "INSERT":
                result = insert(submitData);
                break;
            case "UPLOAD_PROJECT":
                result = uploadCourseware(files);
                break;
            case "GET_DOWNLOAD_URL":
                result = getDownloadUrl(submitData);
                break;
            case "SCORE":
                result = projectScore(submitData);
                break;
            case "EXPERT":
                result = projectExpert(submitData);
                break;
            case "PERFECT":
                result = projectPrefect(submitData, account);
                break;
            case "EXPERT_DETAIL":
                result = expertDetail(submitData);
                break;
            case null:
                result = "提交数据为空";
                break;
            default:
                break;
        }
        //插入更新删除成功返回相应的提示数据，失败均返回0，获取列表和获取教师信息成功返回相应数据
        context.Response.Write(result);
    }

    /// <summary>
    /// 列表查询
    /// </summary>
    /// <param name="submitData">格式：LOAD;pageSize，pageIndex;searchPara1，searchPara2，searchPara3...</param>
    /// <returns></returns>
    string loadList(string submitData, Account account)
    {
        //通过控件传来当页面值，页面大小
        int pageSize = Convert.ToInt32(submitData.Split(';')[1].Split(',')[0]);
        int pageIndex = Convert.ToInt32(submitData.Split(';')[1].Split(',')[1]);
        //获取控件传来的搜索参数
        string[] searchParas = submitData.Split(';')[2].Split(',');
        string sqlWhere = string.Empty;
        if (searchParas[0] != "")
        {
            sqlWhere += " and student_name like @studentName";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and project_name like @projectName";
        }
        if (searchParas[2] != "")
        {
            sqlWhere += " and project_status = @projectStatus";
        }
        if (searchParas[3] != "")
        {
            sqlWhere += " and project_type=@projectType";
        }
        //定义参数数组
        SqlParameter[] paras =
            {
                new SqlParameter("@studentName","%"+searchParas[0]+"%"),
                new SqlParameter("@projectName","%"+searchParas[1]+"%"),
                new SqlParameter("@projectStatus",searchParas[2]),
                new SqlParameter("@projectType",searchParas[3]),
            };
        string tableName = "view_project_info";
        string indexName = "project_status,project_idx desc";
        string countSql = "";
        string sql = "";
        if (account.role_type == "S")
        {
            countSql = @"select count(1) from " + tableName + " where project_delete = 0 and student_idx = '" + account.account_link_idx + "' " + sqlWhere;
            sql = @"select * from (select row_number()over(ORDER BY " + indexName + ") AS rownumber ,* from " + tableName + " where project_delete = 0 and student_idx = '" + account.account_link_idx + "' "
                + sqlWhere
                + " ) T where rownumber between " + (pageSize * (pageIndex - 1) + 1).ToString() + " and " + (pageSize * pageIndex).ToString();
        }
        else
        {
            countSql = @"select count(1) from " + tableName + " where 1=1 " + sqlWhere;
            sql = @"select * from (select row_number()over(ORDER BY " + indexName + ") AS rownumber ,* from " + tableName + " where 1=1 "
                + sqlWhere
                + " ) T where rownumber between " + (pageSize * (pageIndex - 1) + 1).ToString() + " and " + (pageSize * pageIndex).ToString();
        }

        //获取总行数
        int total = SQLServerDBHelp.exNumberSql(countSql, paras);
        //获取表数据
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        //将数据json化
        string jsonstr = ConventDataTableToJson.Serialize(dt);
        //格式打包
        string result = getFinalJson(total, jsonstr);
        //返回结果
        return result;
    }

    //对返回的内容进行包装，获得最终返回给前端的JSON格式数据
    string getFinalJson(int total, string jsonstr)
    {
        return "{\"total\":" + total + ",\"rows\":" + jsonstr + "}";
    }


    //加载单条数据
    public string loadInfo(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = "select * from view_project_info where project_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx) };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        if (dt.Rows.Count != 1) return "0";
        return ConventDataTableToJson.Serialize(dt);
    }

    //删除
    public string delete(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = @"update data_project set project_delete =1 where project_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx), };
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "删除成功！" : "0";
    }

    //插入
    public string insert(string submitData)
    {
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[1].Split(',');
        string fileName = submitData.Split(';')[2];
        Account account = (Account)HttpContext.Current.Session["account"];
        if (data[2] == "0")   //当提交的是普通作品时，直接插入
        {
            string sql = @"Insert into data_project (project_name,subject_idx,student_idx,project_file,project_status,project_type) 
            VALUES(@projectName,@subjectIdx,@studentIdx,@file,0,@projectType)";
            SqlParameter[] paras =
            {
            new SqlParameter("@subjectIdx",data[0]),
            new SqlParameter("@projectName",data[1]),
            new SqlParameter("@projectType",data[2]),
            new SqlParameter("@studentIdx",account.account_link_idx),
            new SqlParameter("@file",fileName),
            };
            return SQLServerDBHelp.exSql(sql, paras) > 1 ? "新增成功！" : "0";
        }
        else if(data[2]=="1" || data[2] == "2")    //当提交的是期中作品或期末作品时，先检查是否已经提交，若已提交则禁止插入，若未提交则插入
        {
            string sql = @"if not exists(select * from data_project where student_idx = @studentIdx and subject_idx = @subjectIdx and project_type = @projectType and project_delete = 0) insert into data_project (project_name,subject_idx,student_idx,project_file,project_status,project_type) VALUES(@projectName,@subjectIdx,@studentIdx,@file,0,@projectType)";
            SqlParameter[] paras =
            {
            new SqlParameter("@subjectIdx",data[0]),
            new SqlParameter("@projectName",data[1]),
            new SqlParameter("@projectType",data[2]),
            new SqlParameter("@studentIdx",account.account_link_idx),
            new SqlParameter("@file",fileName),
            };
            return SQLServerDBHelp.exSql(sql, paras) > 1 ? "新增成功！" : "期中作品或期末作品只可保存一幅，若想重新提交请删除之前提交的作品";
        }
        else
        {
            return "作品类型出错";
        }


    }

    public string uploadCourseware(HttpFileCollection files)
    {
        string result = "";
        string subjectIdx = HttpContext.Current.Request.Form["subjectIdx"].ToString();
        string path = "~/uploadData/" + subjectIdx + "/project";
        if (!Directory.Exists(HttpContext.Current.Server.MapPath(path)))
        {
            Directory.CreateDirectory(HttpContext.Current.Server.MapPath(path));//创建该文件 
        }
        //设置文件名
        string fileNewName = DateTime.Now.ToString("yyyyMMddHHmmssff") + "_" + System.IO.Path.GetFileName(files[0].FileName);
        //保存文件
        files[0].SaveAs(HttpContext.Current.Server.MapPath(path + "/" + fileNewName));
        string msg = "文件上传成功！";
        result = "{\"msg\":\"" + msg + "\",\"filenewname\":\"" + fileNewName + "\"}";
        return result;
    }

    public string getDownloadUrl(string submitData)
    {
        string result = "";
        string projectIdx = submitData.Split(';')[1];
        string sql = "select project_file from data_project where project_idx = @projectIdx";
        SqlParameter[] paras =
            {
                new SqlParameter("projectIdx",projectIdx),
    };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        result = dt.Rows[0][0].ToString();
        return result;
    }

    //作品打分
    public string projectScore(string submitData)
    {
        string projectIdx = submitData.Split(';')[1];
        string projectScore = submitData.Split(';')[2];
        string projectComment = submitData.Split(';')[3];
        string sql = "update data_project set project_score = @score,project_status = '2',project_comment = @comment,project_update=getDate() where project_idx = @idx";
        SqlParameter[] paras =
            {
                new SqlParameter("@score",projectScore),
                new SqlParameter("@idx",projectIdx),
                new SqlParameter("@comment",projectComment),
            };
        string res = SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "打分成功！" : "0";

        string sql1 = "select subject_idx,student_idx,project_type from data_project where project_idx = '"+projectIdx+"'";
        DataTable dt = SQLServerDBHelp.doSql(sql1);
        string subject_idx = dt.Rows[0][0].ToString();
        string student_idx = dt.Rows[0][1].ToString();
        string project_type = dt.Rows[0][2].ToString();
        if(project_type == "1")    //当作品为期中作品时
        {
            string sql2 = "update data_study set study_middle_score = @projectScore,study_update = getDate() where student_idx = @studentIdx and subject_idx = @subjectIdx";
            SqlParameter[] paras2 =
            {
                new SqlParameter("@projectScore",projectScore),
                new SqlParameter("@studentIdx",student_idx),
                new SqlParameter("@subjectIdx",subject_idx),
            };
            return SQLServerDBHelp.exSql(sql2, paras2).ToString() == "1" ? "打分成功！" : "0";
        }
        else if(project_type == "2")     //当作品为期末作品时
        {
            string sql3 = "update data_study set study_terminal_score = @projectScore,study_update = getDate() where student_idx = @studentIdx and subject_idx = @subjectIdx";
            SqlParameter[] paras3 =
            {
                new SqlParameter("@projectScore",projectScore),
                new SqlParameter("@studentIdx",student_idx),
                new SqlParameter("@subjectIdx",subject_idx),
            };
            return SQLServerDBHelp.exSql(sql3, paras3).ToString() == "1" ? "打分成功！" : "0";
        }
        return res;
    }

    //作品评分
    public string projectExpert(string submitData)
    {
        string projectIdx = submitData.Split(';')[1];
        string projectScore = submitData.Split(';')[2];
        string expertComment = submitData.Split(';')[3];
        Account account = (Account)HttpContext.Current.Session["account"];
        string accountIdx = account.account_idx.ToString();
        string checkSql = "select * from data_score_group_score where project_idx = @projectIdx and account_idx = @accountIdx";
        SqlParameter[] checkParas =
            {
                new SqlParameter("@projectIdx",projectIdx),
                new SqlParameter("@accountIdx",accountIdx),
            };
        DataTable dt = SQLServerDBHelp.doSql(checkSql, checkParas);
        string sql1 = "";
        if (dt.Rows.Count >= 1)    //根据当前用户是否已经评分来确定是更新还是插入
            sql1 = "update data_score_group_score set project_score=@projectScore,project_comment=@comment,score_group_score_update=getDate() where project_idx=@projectIdx and account_idx=@accountIdx";
        else
            sql1 = "insert into data_score_group_score(project_idx,project_score,account_idx,project_comment)VALUES(@projectIdx,@projectScore,@accountIdx,@comment)";
        SqlParameter[] paras1 =
                {
                    new SqlParameter("@projectScore",projectScore),
                    new SqlParameter("@comment",expertComment),
                    new SqlParameter("@projectIdx",projectIdx),
                    new SqlParameter("@accountIdx",accountIdx),
                };
        if (SQLServerDBHelp.exSql(sql1, paras1) == 1)    //操作成功后检查是否已经三人评分并且更新平均分
        {
            string sql2 = "update data_project set project_status = (case (select COUNT(*) from data_score_group_score where project_idx = @projectIdx) when 1 then '1' when 2 then '1' when 3 then '2' else project_status end )," +
                "project_score =(select avg(project_score) from data_score_group_score where project_idx=@projectIdx) where project_idx = @projectIdx";
            SqlParameter[] paras2 =
            {
                    new SqlParameter("@projectIdx",projectIdx),
                };
            if(SQLServerDBHelp.exSql(sql2, paras2).ToString() == "1")  //操作成功后若是已经三人评分则将分数更新到study表
            {
                string sql3 = "select * from data_project where project_idx = '"+projectIdx+"'";
                DataTable dt3 = SQLServerDBHelp.doSql(sql3);
                string subject_idx = dt3.Rows[0]["subject_idx"].ToString();
                string student_idx = dt3.Rows[0]["student_idx"].ToString();
                string project_score = dt3.Rows[0]["project_score"].ToString();
                string project_type = dt3.Rows[0]["project_type"].ToString();
                string project_status = dt3.Rows[0]["project_status"].ToString();
                if(project_status == "2" && (project_type == "1" || project_type =="2"))   //当作品处于已批改状态时,并且属于期中作品或者期末作品
                {
                    string target = "";
                    if (project_type == "1")
                        target = "study_middle_score";
                    else
                        target = "study_terminal_score";
                    string sql4 = "update data_study set " + target + " =@score,study_update = getDate() where student_idx = @studentIdx and subject_idx = @subjectIdx";
                    SqlParameter[] paras4 =
                        {
                            new SqlParameter("@score",project_score),
                            new SqlParameter("@studentIdx",student_idx),
                            new SqlParameter("@subjectIdx",subject_idx),
                        };
                    return SQLServerDBHelp.exSql(sql4, paras4).ToString() == "1" ? "评分成功！" : "0";
                }
                else
                {
                    return "操作成功！";
                }
            }
            else
            {
                return "0";
            }
        }
        else
        {
            return "0";
        }
        //if (dt.Rows.Count >= 1)
        //{
        //    string updateSql = "update data_score_group_score set project_score=@score,project_comment=@comment,score_group_score_update=getDate() where project_idx=@projectIdx and account_idx=@accountIdx";
        //    SqlParameter[] paras1 =
        //        {
        //            new SqlParameter("@score",projectScore),
        //            new SqlParameter("@comment",expertComment),
        //            new SqlParameter("@projectIdx",projectIdx),
        //            new SqlParameter("@accountIdx",accountIdx),
        //        };
        //    if (SQLServerDBHelp.exSql(updateSql, paras1) == 1)
        //    {
        //        //string sql = "update data_project set project_score =(select avg(project_score) from data_score_group_score where project_idx=@projectIdx) where project_idx=@projectIdx";
        //        string sql = "update data_project set project_status = (case (select COUNT(*) from data_score_group_score where project_idx = @projectIdx) when 1 then '1' when 2 then '1' when 3 then '2' else project_status end )," +
        //            "project_score =(select avg(project_score) from data_score_group_score where project_idx=@projectIdx) where project_idx = @projectIdx";
        //        SqlParameter[] paras2 =
        //        {
        //            new SqlParameter("@projectIdx",@projectIdx),
        //        };
        //        return SQLServerDBHelp.exSql(sql, paras2).ToString() == "1" ? "更新成功！" : "0";
        //    }
        //    else
        //    {
        //        return "0";
        //    }
        //}
        //else
        //{
        //    string sql1 = "insert into data_score_group_score(project_idx,project_score,account_idx,project_comment)VALUES(@projectIdx,@projectScore,@accountIdx,@comment)";
        //    SqlParameter[] paras3 =
        //        {
        //        new SqlParameter("@projectIdx",projectIdx),
        //        new SqlParameter("@projectScore",projectScore),
        //        new SqlParameter("@accountIdx",account.account_idx),
        //        new SqlParameter("@comment",expertComment),
        //    };
        //    if (SQLServerDBHelp.exSql(sql1, paras3) == 1)
        //    {
        //        string sql = "update data_project set project_status = (case (select COUNT(*) from data_score_group_score where project_idx = @projectIdx) when 1 then '1' when 2 then '1' when 3 then '2' else project_status end )," +
        //            "project_score =(select avg(project_score) from data_score_group_score where project_idx=@projectIdx) where project_idx = @projectIdx";
        //        SqlParameter[] paras4 =
        //            {
        //            new SqlParameter("@projectIdx",@projectIdx),
        //        };
        //        return SQLServerDBHelp.exSql(sql, paras4).ToString() == "1" ? "打分成功！" : "0";
        //    }
        //    else
        //    {
        //        return "0";
        //    }
        //}
    }

    //设置为优秀作品
    public string projectPrefect(string submitData, Account account)
    {
        string projectIdx = submitData.Split(';')[1];
        string selectSql = "select * from data_project where project_idx = @Idx";
        SqlParameter[] paras1 =
            {
                new SqlParameter("@Idx",projectIdx),
            };
        DataTable dt = SQLServerDBHelp.doSql(selectSql, paras1);    //根据作品idx读取这条数据的所有信息
        string insertSql = "insert into data_perfect_project (perfect_project_name,perfect_project_link_idx,subject_idx,student_idx,teacher_idx,perfect_project_file,perfect_project_score) " +
            "VALUES(@name,@linkIdx,@subjectIdx,@studentIdx,@teacherIdx,@file,@score)";
        SqlParameter[] paras2 =
            {
                new SqlParameter("@name",dt.Rows[0]["project_name"].ToString()),
                new SqlParameter("@linkIdx",dt.Rows[0]["project_idx"].ToString()),
                new SqlParameter("@subjectIdx",dt.Rows[0]["subject_idx"].ToString()),
                new SqlParameter("@studentIdx",dt.Rows[0]["student_idx"].ToString()),
                new SqlParameter("@teacherIdx",dt.Rows[0]["teacher_idx"].ToString()),
                new SqlParameter("@file",dt.Rows[0]["project_file"].ToString()),
                new SqlParameter("@score",dt.Rows[0]["project_score"].ToString()),
            };
        return SQLServerDBHelp.exSql(insertSql, paras2).ToString() == "1" ? "设置成功！" : "0";
    }

    //查看专家组评分详情
    public string expertDetail(string submitData)
    {
        string projectIdx = submitData.Split(';')[1];
        string sql = "select * from view_score_group_score where project_idx = @idx";
        SqlParameter[] paras =
        {
            new SqlParameter("idx",projectIdx),
        };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        return ConventDataTableToJson.Serialize(dt);
    }

}