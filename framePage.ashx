
<%@ WebHandler Language="C#" Class="framePage" %>

using System;
using System.Web;
using System.Data;
using System.Text;
using System.Web.SessionState;
using System.Data.SqlClient;
using System.IO;
using System.Diagnostics;
using System.Web.Script.Serialization;
using System.Collections.Generic;

public class framePage : IHttpHandler, IReadOnlySessionState
{
    public void ProcessRequest(HttpContext context)
    {
        string result = "";
        context.Response.ContentType = "text/plain";
        string submitData = context.Request.Form["submitData"] == null ? "NULL" : context.Request.Form["submitData"];
        string option = submitData.Split(';')[0];
        switch (option)
        {
            case "logout":
                HttpContext.Current.Session.Clear();
                break;
            case "getAccount":
                {
                    Account account = (Account)HttpContext.Current.Session["account"];
                    if (account != null)
                    {
                        string sql = @"select * from view_account_name where account_idx=" + account.account_idx;
                        List<Account> accountList=SQLServerDBHelp.doSqlToObject<Account>(sql);
                        account.account_name = accountList[0].account_name;
                        sql = @"select count(1) from view_message_info where message_state='N' and receive_account_idx=" + account.account_idx;
                        account.messageCount = SQLServerDBHelp.exNumberSql(sql);
                        sql = @"select top(10) * from view_message_info where message_state='N' and receive_account_idx=" + account.account_idx
                                +" order by message_create desc";
                        account.messageItems = SQLServerDBHelp.doSqlToObject<Message>(sql);
                    }
                    JavaScriptSerializer serializer = new JavaScriptSerializer();
                    result = serializer.Serialize(account);
                }
                break;
            case "messageRead":
                string messageIdx= submitData.Split(';')[1];
                string sqlRead = @"update data_message set message_state='R' where message_idx=" + messageIdx;
                SQLServerDBHelp.exSql(sqlRead);
                Account accountRead = (Account)HttpContext.Current.Session["account"];
                JavaScriptSerializer serializerRead = new JavaScriptSerializer();
                foreach(Message msg in accountRead.messageItems)
                {
                    if (msg.message_idx.ToString() == messageIdx)
                    {
                        result = serializerRead.Serialize(msg);
                    }
                }
                break;
        }
        context.Response.Write(result);
    }
    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
}
