<%@ WebHandler Language="C#" Class="changePassword" %>

using System;
using System.Web;
using System.Data;
using System.Text;
using System.Data.SqlClient;
using System.Web.SessionState;

public class changePassword : IHttpHandler ,IReadOnlySessionState
{

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        string submitData = context.Request.Form["submitData"];
        string option = submitData.Split(';')[0];
        string result = "";
        switch (option)
        {
            case "UPDATE":
                result = update(submitData);
                break;
            case null:
                result = "提交数据为空";
                break;
            default:
                break;
        }
        //更新删除成功返回相应的提示数据，失败均返回0，获取列表和获取教师信息成功返回相应数据
        context.Response.Write(result);
    }

    public bool IsReusable {
        get {
            return false;
        }
    }
    public string update(string submitData)
    {
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string oldPassword = submitData.Split(';')[1];
        string newPassword = submitData.Split(';')[2];
        Account account = (Account)HttpContext.Current.Session["account"];
        string sql = @"update sys_account set account_password=@newPassword where account_idx=@idx and account_password=@oldPassword";
        SqlParameter[] paras =
        {
            new SqlParameter("@newPassword",newPassword),
            new SqlParameter("@oldPassword",oldPassword),
            new SqlParameter("@idx",account.account_idx),
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "密码修改成功！" : "0";
    }
}