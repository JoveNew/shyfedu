<%@ WebHandler Language="C#" Class="newsEdit" %>

using System;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Web.Script.Serialization;

public class newsEdit : IHttpHandler {

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
            case "UPDATE":
                result = updateInfo(submitData);
                break;
            case "INSERT":
                result = insertInfo(submitData);
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
        string planIdx = submitData.Split(';')[1];
        string sql = @"select news_title,news_content from view_news_info where news_idx=@idx";
        SqlParameter[] paras = {
                new SqlParameter("@idx", planIdx)
            };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        string result = "0";
        if (dt.Rows.Count == 1)
        {
            result = ConventDataTableToJson.Serialize(dt);
        }
        return result;
    }

    public string updateInfo(string submitData)
    {
        string newsIdx = submitData.Split(';')[1];
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        data_news data = serializer.Deserialize<data_news>(submitData.Split(';')[2]);
        // 1. 定义sql语句
        string sql = @"update data_news set news_title=@title,news_content=@content,news_update=getDate() where news_idx=@idx";
        // 2. 定义传入的param数组        
        SqlParameter[] paras =
        {
            new SqlParameter("@title",data.news_title),
            new SqlParameter("@content",data.news_content),
            new SqlParameter("@idx",newsIdx)
        };
        // 3.将sql语句和param数组传入执行函数进行执行，根据执行结果返回提示信息或0。
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "更新成功！" : "0";
    }

    public string insertInfo(string submitData)
    {
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        data_news data = serializer.Deserialize<data_news>(submitData.Split(';')[1]);
        // 1. 定义sql语句
        string sql = @"insert into data_news (news_title,news_content) VALUES(@title,@content)";
        // 2. 定义传入的param数组        
        SqlParameter[] paras =
        {
            new SqlParameter("@title",data.news_title),
            new SqlParameter("@content",data.news_content)
        };
        // 3.将sql语句和param数组传入执行函数进行执行，根据执行结果返回提示信息或0。
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "增加成功！" : "0";
    }
    public class data_news
    {
        public string news_title { get ; set; }
        public string news_content { get ; set; }
    }
}