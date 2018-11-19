<%@ WebHandler Language="C#" Class="planOfContentAndSchedule" %>

using System;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Web.SessionState;

public class planOfContentAndSchedule : IHttpHandler,IReadOnlySessionState {
    
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
            case "TITLE":
                result = title(submitData);
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
        Account account = (Account)HttpContext.Current.Session["account"];
        int accountIdx = account.account_idx;
        string sql = @"select plan_file,major_name,class_name,account_name,subject_name,subject_hour from data_plan t1
                        left join data_subject t2 on t1.subject_idx=t2.subject_idx
                        left join data_class t3 on t2.class_idx=t3.class_idx
                        left join dbo.dict_major_info t4 on t3.major_code =t4.major_code
                        left join view_account_name t5 on t5.account_idx=@accontidx
                        where plan_idx=@idx";
        SqlParameter[] paras = {
                new SqlParameter("@idx", planIdx),
                new SqlParameter("@accontidx", accountIdx),
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
        string planIdx = submitData.Split(';')[1];
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string data = submitData.Split(';')[2];
        string time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        // 1. 定义sql语句
        string sql = @"update data_plan set plan_file=@file,plan_update=getDate() where plan_idx=@idx";
        // 2. 定义传入的param数组        
        SqlParameter[] paras =
        {
            new SqlParameter("@file",data),
            new SqlParameter("@idx",planIdx)
        };
        // 3.将sql语句和param数组传入执行函数进行执行，根据执行结果返回提示信息或0。
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "更新成功！" : "0";
    }
        
    public string title(string submitData)
    {
        string planIdx = submitData.Split(';')[1];
        string sql = @"select major_name from view_plan_info t1 left join data_subject t2 on 
                    t2.subject_idx = t1.subject_idx left join data_class t3 on 
                    t3.class_idx=t2.class_idx left join dict_major_info t4 on t4.major_code=t3.major_code
                    where plan_idx = @idx";
        SqlParameter[] paras =
        {
            new SqlParameter("@idx",planIdx),
        };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        return ConventDataTableToJson.Serialize(dt);
    }
}