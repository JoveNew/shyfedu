<%@ WebHandler Language="C#" Class="planManage" %>

using System;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Web.SessionState;

public class planManage : IHttpHandler,IReadOnlySessionState
{

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        //获取操作类型
        string submitData = context.Request.Form["submitData"] == "null" ? "null;" : context.Request.Form["submitData"];
        HttpFileCollection files = context.Request.Files;
        string option = files.Count > 0 ? "UPLOAD_PLAN" : submitData.Split(';')[0];
        string result = "";
        switch (option)
        {
            case "LOAD_LIST":
                result = loadList(submitData);
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
            case "UPDATE":
                result = update(submitData);
                break;
            case "SUBMIT":
                result = submit(submitData);
                break;
            case "CHECKPASS":
                result = checkPass(submitData);
                break;
            case "CHECKBACK":
                result = checkBack(submitData);
                break;
            case "UPLOAD_PLAN":
                result = uploadPlan(files);
                break;
            case "GET_DOWNLOAD_URL":
                result = getDownloadUrl(submitData);
                break;
            case "COPY":
                result = copyPlan(submitData);
                break;
            case "WEEK":
                result = getWeek(submitData);
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

    public bool IsReusable {
        get {
            return false;
        }
    }

    /// <summary>
    /// 列表查询
    /// </summary>
    /// <param name="submitData">格式：LOAD;pageSize，pageIndex;searchPara1，searchPara2，searchPara3...</param>
    /// <returns></returns>
    string loadList(string submitData)
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
            sqlWhere += " and plan_name like @planName";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and subject_idx=@subjectIdx";
        }
        //定义参数数组
        SqlParameter[] paras1 =
            {
                new SqlParameter("@planName","%"+searchParas[0]+"%"),
                new SqlParameter("@subjectIdx",searchParas[1]),
            };
        SqlParameter[] paras2 =
            {
                new SqlParameter("@planName","%"+searchParas[0]+"%"),
                new SqlParameter("@subjectIdx",searchParas[1]),
            };
        string tableName = "view_plan_info";
        string indexNmae = "plan_week";
        //*****************************修改内容end******************************
        string countSql = @"select count(1) from " + tableName + " where 1=1 " + sqlWhere;
        string sql = @"select * from (select row_number()over(ORDER BY " + indexNmae + ") AS rownumber ,* from " + tableName + " where 1=1 "
            + sqlWhere
            + " ) T where rownumber between " + (pageSize * (pageIndex - 1) + 1).ToString() + " and " + (pageSize * pageIndex).ToString();
        //获取总行数
        int total = SQLServerDBHelp.exNumberSql(countSql,paras1);
        //获取表数据
        DataTable dt = SQLServerDBHelp.doSql(sql, paras2);
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
        string sql = "select plan_idx,plan_name,subject_idx,subject_name,teacher_idx,teacher_name,account_idx,plan_type,plan_remark from view_plan_info where plan_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx) };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        if (dt.Rows.Count != 1) return "0";
        return ConventDataTableToJson.Serialize(dt);
    }

    //删除
    public string delete(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = @"update data_plan set plan_delete =1 where plan_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx), };
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "删除成功！" : "0";
    }

    //更新
    public string update(string submitData)
    {
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[2].Split(',');
        string planIdx = submitData.Split(';')[1];
        string sql = @"update data_plan set plan_name=@planName,subject_idx=@subjectIdx,teacher_idx=@teacherIdx,
                     account_idx=@accountIdx,plan_type=@planType,plan_remark=@planRemark,plan_file=@file where plan_idx=@planIdx ";
        SqlParameter[] paras =
        {
            new SqlParameter("@planName",data[0]),
            new SqlParameter("@subjectIdx",data[1]),
            new SqlParameter("@teacherIdx",data[2]),
            new SqlParameter("@accountIdx",data[3]),
            new SqlParameter("@planType",data[4]),
            new SqlParameter("@planRemark",data[5]),
            new SqlParameter("@file",data[6]),
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "新增成功！" : "0";
    }

    //插入
    public string insert(string submitData)
    {
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[1].Split(',');
        string fileName = submitData.Split(';')[2];
        string sql = @"Insert into data_plan (plan_name,subject_idx,teacher_idx,account_idx,plan_type,plan_remark,plan_file) 
            VALUES(@planName,@subjectIdx,@teacherIdx,@accountIdx,@planType,@planRemark,@file)";
        SqlParameter[] paras =
        {
            new SqlParameter("@planName",data[0]),
            new SqlParameter("@subjectIdx",data[1]),
            new SqlParameter("@teacherIdx",data[2]),
            new SqlParameter("@accountIdx",data[3]),
            new SqlParameter("@planType","0"),
            new SqlParameter("@planRemark",data[4]),
            new SqlParameter("@file",fileName),
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "新增成功！" : "0";
    }

    public string uploadPlan(HttpFileCollection files)
    {
        string result = "";
        string subjectIdx = HttpContext.Current.Request.Form["subjectIdx"].ToString();
        string path = "~/uploadData/" + subjectIdx + "/plan";
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
        string planIdx = submitData.Split(';')[1];
        string sql = "select plan_file from data_plan where plan_idx = @planIdx";
        SqlParameter[] paras ={
                new SqlParameter("planIdx",planIdx),
        };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        result = dt.Rows[0][0].ToString();
        return result;
    }

    public string copyPlan(string submitData)
    {
        string planIdx = submitData.Split(';')[1];
        string subjectIdx = submitData.Split(';')[2];
        string planWeek = submitData.Split(';')[3];
        string sql = @"update dbo.data_plan set plan_file = (select plan_file from dbo.data_plan where plan_idx=@planIdx),
                        plan_update =getDate() where subject_idx=@subjectIdx and plan_week =@planWeek and plan_type=1";
        SqlParameter[] paras = {
            new SqlParameter("subjectIdx",subjectIdx),
            new SqlParameter("planWeek",planWeek),
            new SqlParameter("planIdx",planIdx),
        };
        var result = SQLServerDBHelp.exSql(sql, paras)==1 ? "操作成功！":"0";
        return result;
    }

    public string submit(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = @"update data_plan set plan_state=@state,plan_update=getDate() where plan_idx=@idx";
        SqlParameter[] paras =
        {
            new SqlParameter("@idx",idx),
            new SqlParameter("@state","C"),
        };
        return SQLServerDBHelp.exSql(sql,paras).ToString() == "1" ? "操作成功！" : "0";
    }

    public string checkPass(string submitData)
    {
        string idx = submitData.Split(';')[1];
        Account account = (Account)HttpContext.Current.Session["account"];
        string sql = @"update data_plan set plan_state=@state,account_idx=@accountIdx,plan_update=getDate() where plan_idx=@idx";
        SqlParameter[] paras =
        {
            new SqlParameter("@idx",idx),
            new SqlParameter("@state","F"),
            new SqlParameter("@accountIdx",account.account_idx),
        };
        return SQLServerDBHelp.exSql(sql,paras).ToString() == "1" ? "操作成功！" : "0";
    }

    public string checkBack(string submitData)
    {
        string idx = submitData.Split(';')[1];
        Account account = (Account)HttpContext.Current.Session["account"];
        string sql = @"update data_plan set plan_state=@state,account_idx=@accountIdx,plan_update=getDate() where plan_idx=@idx";
        SqlParameter[] paras =
        {
            new SqlParameter("@idx",idx),
            new SqlParameter("@state","N"),
            new SqlParameter("@accountIdx",account.account_idx),
        };
        return SQLServerDBHelp.exSql(sql,paras).ToString() == "1" ? "操作成功！" : "0";
    }

    public string getWeek(string submitData)
    {
        string subjectIdx = submitData.Split(';')[1];
        string sql = @"select plan_week from dbo.view_plan_info where subject_idx=@idx and plan_state='N'";
        SqlParameter[] paras =
        {
            new SqlParameter("@idx",subjectIdx),
        };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        string jsonstr = ConventDataTableToJson.Serialize(dt);
        return jsonstr;
    }
}