
<%@ WebHandler Language="C#" Class="homeworkManage" %>

using System;
using System.Web;
using System.Data;
using System.Web.SessionState;
using System.Data.SqlClient;
using System.IO;
using System.Collections.Generic;

public class homeworkManage : IHttpHandler,IReadOnlySessionState
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
        string option = files.Count > 0 ? "UPLOAD_HOMEWORK" : submitData.Split(';')[0];
        string result = "";
        switch (option)
        {
            case "LOAD_LIST":
                result = loadList(submitData,account);
                break;
            case "LOAD_INFO":
                result = loadInfo(submitData);
                break;
            case "DELETE":
                result = delete(submitData);
                break;
            case "INSERT":
                result = insert(submitData,account);
                break;
            case "UPLOAD_HOMEWORK":
                result = uploadHomework(files);
                break;
            case "GET_DOWNLOAD_URL":
                result = getDownloadUrl(submitData);
                break;
            case "SCORE":
                result = homeworkScore(submitData);
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
    string loadList(string submitData,Account account)
    {
        //通过控件传来当页面值，页面大小
        int pageSize = Convert.ToInt32(submitData.Split(';')[1].Split(',')[0]);
        int pageIndex = Convert.ToInt32(submitData.Split(';')[1].Split(',')[1]);
        //获取控件传来的搜索参数
        string[] searchParas = submitData.Split(';')[2].Split(',');
        string sqlWhere = string.Empty;
        //*****************************修改内容start**************************
        if (searchParas[0] != "")
        {
            sqlWhere += " and student_code=@studentCode";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and student_name=@studentName";
        }
        if (searchParas[2] != "")
        {
            sqlWhere += " and homework_status=@homeworkStatus";
        }
        if (searchParas[3] != "")
        {
            sqlWhere += " and lesson_idx=@lessonIdx";
        }
        //定义参数数组
        SqlParameter[] paras =
            {
                new SqlParameter("@studentCode",searchParas[0]),
                new SqlParameter("@studentName",searchParas[1]),
                new SqlParameter("@homeworkStatus",searchParas[2]),
                new SqlParameter("@lessonIdx",searchParas[3]),
            };
        string tableName = "view_homework_info";
        string indexNmae = "homework_status,homework_idx";
        string roleType = account.role_type;
        string countSql = "";
        string sql = "";
        if(roleType == "S")
        {
            countSql = @"select count(1) from " + tableName + " where homework_delete=0 and student_idx = '"+account.account_link_idx+"' "+ sqlWhere;
            sql = @"select * from (select row_number()over(ORDER BY " + indexNmae + " desc) AS rownumber ,* from " + tableName + " where homework_delete=0 and student_idx = '"+account.account_link_idx+"' "
            + sqlWhere
            + " ) T where rownumber between " + (pageSize * (pageIndex - 1) + 1).ToString() + " and " + (pageSize * pageIndex).ToString();
        }
        else
        {
            countSql = @"select count(1) from " + tableName + " where homework_delete=0 "+ sqlWhere;
            sql = @"select * from (select row_number()over(ORDER BY " + indexNmae + " desc) AS rownumber ,* from " + tableName + " where homework_delete=0 "
            + sqlWhere
            + " ) T where rownumber between " + (pageSize * (pageIndex - 1) + 1).ToString() + " and " + (pageSize * pageIndex).ToString();
        }

        //获取总行数
        int total = SQLServerDBHelp.exNumberSql(countSql,paras);
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
        string sql = "select * from view_homework_info where homework_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx) };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        if (dt.Rows.Count != 1) return "0";
        return ConventDataTableToJson.Serialize(dt);
    }

    //删除
    public string delete(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = @"update data_homework set homework_delete=1,homework_update=getDate() where homework_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx), };
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "删除成功！" : "0";
    }

    //插入
    public string insert(string submitData,Account account)
    {
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[1].Split(',');
        string fileName = submitData.Split(';')[2];
        string lessonIdx = submitData.Split(';')[3];
        string sql1 = "select teacher_idx from data_lesson where lesson_idx = '" + lessonIdx + "'";
        DataTable dt = SQLServerDBHelp.doSql(sql1);
        string teacherIdx = dt.Rows[0][0].ToString();
        string sql2 = @"Insert into data_homework (homework_name,lesson_idx,student_idx,teacher_idx,homework_file,homework_status) 
            VALUES(@homeworkName,@lessonIdx,@studentIdx,@teacherIdx,@file,0)";
        SqlParameter[] paras =
        {
            new SqlParameter("@homeworkName",data[0]),
            new SqlParameter("@lessonIdx",lessonIdx),
            new SqlParameter("@studentIdx",account.account_link_idx),
            new SqlParameter("@teacherIdx",teacherIdx),
            new SqlParameter("@file",fileName),
        };
        return SQLServerDBHelp.exSql(sql2, paras)>0 ? "新增成功！" : "0";
    }

    public string uploadHomework(HttpFileCollection files)
    {
        string result = "";
        string subjectIdx = HttpContext.Current.Request.Form["subjectIdx"].ToString();
        string path = "~/uploadData/" + subjectIdx + "/homework";
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
        string homeworkIdx = submitData.Split(';')[1];
        string sql = "select homework_file from data_homework where homework_idx = @homeworkIdx";
        SqlParameter[] paras =
            {
                new SqlParameter("@homeworkIdx",homeworkIdx),
    };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        result = dt.Rows[0][0].ToString();
        return result;
    }

    public string homeworkScore(string submitData)
    {
        string homeworkIdx = submitData.Split(';')[1];
        string homeworkScore = submitData.Split(';')[2];
        string sql = "update data_homework set homework_score = @score,homework_status = '1' where homework_idx = @idx";
        SqlParameter[] paras =
            {
                new SqlParameter("@score",homeworkScore),
                new SqlParameter("@idx",homeworkIdx),
            };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "打分成功！" : "0";
    }

}