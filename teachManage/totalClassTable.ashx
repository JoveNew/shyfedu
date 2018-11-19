<%@ WebHandler Language="C#" Class="totalClassTable" %>

using System;
using System.Web;
using System.Data;
using System.Data.SqlClient;

public class totalClassTable : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        string submitData = context.Request.Form["submitData"] == null ? "NULL" : context.Request.Form["submitData"];
        string option = submitData.Split(';')[0];
        string result = "";
        switch (option)
        {
            case "LOAD_INFO":
                result = loadInfo(submitData);
                break;
            case "LOAD_CLASS":
                result = loadClass(submitData);
                break;
            case "NULL":
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

    public string loadInfo(string submitData)
    {
        string code = submitData.Split(';')[1];
        string sql = @"select * from view_schedule_info where year_code=@code";
        SqlParameter[] paras = {
                new SqlParameter("@code", code)
            };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        string result = "0";
        if (dt.Rows.Count >= 1)
        {
            result = ConventDataTableToJson.Serialize(dt);
        }
        return result;
    }

    public string loadClass(string submitData)
    {
        string code = submitData.Split(';')[1];
        string sql = @"select distinct class_idx,class_name from view_schedule_info where year_code=@code order by class_name asc";
        SqlParameter[] paras = {
            new SqlParameter("@code", code)
        };
        DataTable dt = SQLServerDBHelp.doSql(sql,paras);
        string result = "0";
        if (dt.Rows.Count >= 1)
        {
            result = ConventDataTableToJson.Serialize(dt);
        }
        return result;
    }
}