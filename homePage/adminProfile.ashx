<%@ WebHandler Language="C#" Class="adminProfile" %>

using System;
using System.Web;
using System.Data;
using System.Text;
using System.Data.SqlClient;

public class adminProfile : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        string submitData = context.Request.Form["submitData"];
        string option = submitData.Split(';')[0];
        string result = "";
        switch (option)
        {
            case "ADM_INFO":
                result = loadAdmInfo(submitData);
                break;
            case "TEA_INFO":
                result = loadTeaInfo(submitData);
                break;
            case "STU_INFO":
                result = loadStuInfo(submitData);
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

    public string loadAdmInfo(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = "select account_idx,account_name,account_password,account_link_idx," +
            "role_type,account_delete from view_account_info where account_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx) };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        if (dt.Rows.Count != 1) return "0";
        return ConventDataTableToJson.Serialize(dt);
    }

    public string loadStuInfo(string submitData) {
        string idx = submitData.Split(';')[1];
        string sql = "select * from view_account_student where account_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx), };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        if (dt.Rows.Count != 1) return "0";
        return ConventDataTableToJson.Serialize(dt);
    }

    public string loadTeaInfo(string submitData) {
        string idx = submitData.Split(';')[1];
        string sql = "select * from view_account_teacher where account_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx) };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        if (dt.Rows.Count != 1) return "0";
        return ConventDataTableToJson.Serialize(dt);
    }


    public bool IsReusable {
        get {
            return false;
        }
    }

}