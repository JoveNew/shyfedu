<%@ WebHandler Language="C#" Class="scheduleClassTable" %>

using System;
using System.Web;
using System.Data;
using System.Web.SessionState;
using System.Data.SqlClient;
using System.Collections.Generic;

public class scheduleClassTable : IHttpHandler, IReadOnlySessionState
{
    private SQLConnection m_con = new SQLConnection();
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        Account account = (Account)HttpContext.Current.Session["account"];
        if (account == null)
        {
            context.Response.Write("当前为无登录状态");
        }
        //获取操作类型
        string submitData = context.Request.Form["submitData"] == null ? "NULL" : context.Request.Form["submitData"];
        string option = submitData.Split(';')[0];

        string result = "";
        switch (option)
        {
            case "getLessonData":
                result = getLessonData(submitData);
                break;
        }
        //插入更新删除成功返回相应的提示数据，失败均返回0，获取列表和获取学生信息成功返回相应数据
        context.Response.Write(result);
    }

    public string getLessonData(string submitData)
    {
        string classIdx = submitData.Split(';')[1];
        string yearCode = submitData.Split(';')[2];
        string sql = "select * from view_schedule_info where 1=1";
        if (classIdx != "")
        {
            sql += " and class_idx = '" + classIdx + "'";
        }
        if (yearCode != "")
        {
            sql += " and year_code = '" + yearCode + "'";
        }
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string result = "0";
        if (dt.Rows.Count >= 1)
        {
            result = ConventDataTableToJson.Serialize(dt);
        }
        return result;
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}