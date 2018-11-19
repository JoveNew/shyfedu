/*
作者：钱祺
最新修改日期：2018.9.14
文档说明：
根据用户输入的账号密码，将是否登陆成功的结果传送给前台。作者：钱祺
最新修改日期：2018.9.17
文档说明：解析获得的dataTable二维数组，将account_type中的内容给result并传给前台作者：钱祺
最新修改日期：2018.9.18
文档说明：用户登录成功后，把用户的各类信息存放在session中*/
<%@ WebHandler Language="C#" Class="login" %>

using System;
using System.Web;
using System.Data;
using System.Text;
using System.Web.SessionState;
using System.Data.SqlClient;
using System.IO;
using System.Diagnostics;

public class login : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext context)
    {

        string result = "";
        context.Response.ContentType = "text/plain";
        string submitData = context.Request.Form["submitData"] == null ? "NULL" : context.Request.Form["submitData"];
        string option = submitData.Split(';')[0];
        string userName="";
        string userPwd="";
        string openid="";
        string delete = "";
        string sql="";
        DataTable dt=null;
        switch (option)
        {
            case "LOGIN":
                userName = submitData.Split(';')[1].Split(',')[0];
                userPwd = submitData.Split(';')[1].Split(',')[1];
                openid = submitData.Split(';')[1].Split(',')[2];
                sql = "select * from sys_account where account_name = @Name and account_password =@Pwd";
                SqlParameter[] paras1 =
                        {
                            new SqlParameter("@Name",userName),
                            new SqlParameter("@Pwd",userPwd),
                        };
                dt = SQLServerDBHelp.doSql(sql, paras1);
                break;
            case "OPENID":
                openid=submitData.Split(';')[1];
                sql = "select top 1 * from sys_account where wx_open_id = @openid order by wx_last_login desc";
                SqlParameter[] paras2 =
                        {
                            new SqlParameter("@openid",openid)

                        };
                dt = SQLServerDBHelp.doSql(sql, paras2);
                break;
        }
        if (dt.Rows.Count == 0)
        {
            if(option=="LOGIN")
            {
                context.Response.Write("error");
            }
            else
            {
                context.Response.Write("error_wx");
            }
        }
        else
        {
            delete = dt.Rows[0]["account_delete"].ToString();
            if (delete == "True")
            {
                context.Response.Write("error2");
            }
            else
            {
                Account user = new Account();
                user.account_idx = Convert.ToInt32(dt.Rows[0]["account_idx"]);
                user.account_link_idx = dt.Rows[0]["account_link_idx"].ToString();
                user.account_name = dt.Rows[0]["account_name"].ToString();
                user.role_type = dt.Rows[0]["role_type"].ToString();
                string sql1 = "select * from  sys_ability t1 left join sys_role_ability t2 on t1.ability_code=t2.ability_code " +
                    "where role_type='" + dt.Rows[0]["role_type"].ToString() + "'";
                DataTable dt1 = SQLServerDBHelp.doSql(sql1);
                foreach (DataRow dr in dt1.Rows)
                {
                    Ability abil = new Ability();
                    abil.ability_code = dr["ability_code"].ToString();
                    abil.ability_name = dr["ability_name"].ToString();
                    abil.ability_title = dr["ability_title"].ToString();
                    abil.icon = dr["icon"].ToString();
                    user.abilityItems.Add(abil);
                }
                HttpContext.Current.Session.Clear();
                HttpContext.Current.Session.Add("account", user);
                result = dt.Rows.Count.ToString();

                string setStr="";
                if(openid!="")
                {
                    setStr+=" wx_last_login=getdate(),wx_open_id='"+openid+"'";
                }
                else
                {
                    setStr+=" pw_last_login=getdate()";
                }
                string sql2="update sys_account set "+setStr+" where account_idx="+user.account_idx;
                SQLServerDBHelp.exSql(sql2);
                context.Response.Write(result);
            }
        }


    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}
