<%@ WebHandler Language="C#" Class="homePage" %>

using System;
using System.Web;
using System.Data;
using System.Web.SessionState;
using System.Data.SqlClient;
using System.Collections.Generic;

public class homePage : IHttpHandler,IReadOnlySessionState
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

        HttpFileCollection files = context.Request.Files;
        if (option == "NULL" && files.Count > 0)
        {
            option = "UPLOAD_DOCUMENT";
        }

        string result = "";
        switch (option)
        {
            case "getLessonData":
                result = getLessons(submitData, account);
                break;
            case "getNewsData":
                result = getNewsData();
                break;
            case "CAROUSEL":
                result = getCarousel();
                break;
            case "NULL":
                //result = "提交数据为空";
                result = getLessons(submitData, account);
                break;
        }
        //插入更新删除成功返回相应的提示数据，失败均返回0，获取列表和获取学生信息成功返回相应数据
        context.Response.Write(result);
    }
    //接口函数实现
    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

    //对返回的内容进行包装，获得最终返回给前端的json格式数据
    string getFinalJson(int total, string jsonstr)
    {
        return "{\"total\":" + total + ",\"rows\":" + jsonstr + "}";
    }

    public string getLessons(string submitData, Account account)
    {
        string result = "0";
        string roleType = account.role_type;
        string sql = "";
        string linkIdx = account.account_link_idx;
        SqlParameter[] paras =
        {
             new SqlParameter("@idx",linkIdx),
        };
        if (roleType == "S")
        {
            result = "1";     //区分其他人员登录主页，学生登录时即便无课也将课表画出
            sql = @"select * from view_schedule_info where year_code = (select year_code from dict_year_info where year_status='C') 
                and class_idx in (select class_idx from data_student where student_idx = @idx union 
                                    select link_class_idx from data_student where student_idx = @idx)";        //获取对应课程
            DataTable dt = SQLServerDBHelp.doSql(sql, paras);
            if (dt.Rows.Count >= 1)
            {
                result = ConventDataTableToJson.Serialize(dt);
            }
        }
        else if (roleType == "T")
        {
            result = "1";           //区分其他人员登录主页，教师登录时即便无课也将课表画出
            sql = "select * from view_schedule_info where year_code = (select year_code from dict_year_info where year_status='C') and teacher_idx = @idx";
            DataTable dt = SQLServerDBHelp.doSql(sql, paras);
            if (dt.Rows.Count >= 1)
            {
                result = ConventDataTableToJson.Serialize(dt);
            }
        }
        return result;
    }

    public string getNewsData()
    {
        string sql = "select news_idx,news_title,news_day from data_news where news_delete =0 order by news_day desc";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string result = "0";
        if (dt.Rows.Count >= 1)
        {
            result = ConventDataTableToJson.Serialize(dt);
        }
        return result;
    }

    public string getCarousel()
    {
        string sql = "select TOP 3 perfect_project_file from data_perfect_project where home_page_flag = '1' order by perfect_project_update DESC";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string result = "0";
        if (dt.Rows.Count >= 1)
        {
            result = ConventDataTableToJson.Serialize(dt);
        }
        return result;
    }
}