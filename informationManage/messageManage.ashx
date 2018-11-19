<%@ WebHandler Language="C#" Class="messageManage" %>

using System;
using System.Web;
using System.Data;
using System.Text;
using System.Data.SqlClient;
using System.Web.SessionState;

public class messageManage : IHttpHandler,IReadOnlySessionState {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        string submitData = context.Request.Form["submitData"];
        string option = submitData.Split(';')[0];
        string result = "";
        switch (option)
        {
            case "LOAD_LIST":
                result = loadList(submitData);
                break;
            case "LOAD_INFO":
                result = loadInfo(submitData);
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

    string loadList(string submitData)
    {
        //通过控件传来当页面值，页面大小
        int pageSize = Convert.ToInt32(submitData.Split(';')[1].Split(',')[0]);
        int pageIndex = Convert.ToInt32(submitData.Split(';')[1].Split(',')[1]);
        //获取控件传来的搜索参数
        string[] searchParas = submitData.Split(';')[2].Split(',');
        string sqlWhere = string.Empty;
        //*****************************修改内容start**************************
        //定义参数数组
        SqlParameter[] paras =
            {
                new SqlParameter("@title","%"+searchParas[0]+"%"),
                new SqlParameter("@type",searchParas[1]),
                new SqlParameter("@source","%"+searchParas[2]+"%"),
                new SqlParameter("@receive","%"+searchParas[3]+"%"),
                new SqlParameter("@state",searchParas[4]),
            };
        if (searchParas[0] != "")
        {
            sqlWhere += " and  message_title like @title";
        }
        if (searchParas[1] != "null")
        {
            sqlWhere += " and message_type = @type";
        }
        if (searchParas[2] != "")
        {
            sqlWhere += " and source_account_name like @source";
        }
        if (searchParas[3] != "")
        {
            sqlWhere += " and receive_account_name like @receive";
        }
        if (searchParas[4] != "null")
        {
            sqlWhere += " and message_state = @state";
        }
        Account account = (Account)HttpContext.Current.Session["account"];
        if (account.role_type != "A")
        {
            sqlWhere += " and receive_account_idx="+account.account_idx;
        }
        string tableName = "view_message_info";
        string indexName = "message_state asc,message_update desc,message_idx";
        //*****************************修改内容end******************************
        string countSql = @"select count(1) from " + tableName + " where 1=1 " + sqlWhere;
        string sql = @"select * from (select row_number()over(ORDER BY " + indexName + ") AS rownumber ,* from " + tableName + " where 1=1 "
            + sqlWhere
            + " ) T where rownumber between " + (pageSize * (pageIndex - 1) + 1).ToString() + " and " + (pageSize * pageIndex).ToString();
        //获取总行数
        int total = SQLServerDBHelp.exNumberSql(countSql,paras);
        //获取表数据
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        //将数据json化
        string jsonstr = ConventDataTableToJson.Serialize(dt);
        //格式打包
        string result = getFinalJson(total, jsonstr);
        //返回结果
        return result;
    }

    string getFinalJson(int total, string jsonstr)
    {
        return "{\"total\":" + total + ",\"rows\":" + jsonstr + "}";
    }

    public string loadInfo(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = "select * from view_message_info where message_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx) };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        if (dt.Rows.Count != 1) return "0";
        return ConventDataTableToJson.Serialize(dt);
    }
}