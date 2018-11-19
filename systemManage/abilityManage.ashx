<%@ WebHandler Language="C#" Class="abilityManage" %>

using System;
using System.Web;
using System.Data;
using System.Data.SqlClient;

public class abilityManage : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        string submitData = context.Request.Form["submitData"];
        string result = loadList(submitData);
        context.Response.Write(result);
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

    string loadList(string submitData)
    {
        int pageSize = Convert.ToInt32(submitData.Split(';')[1].Split(',')[0]);
        int pageIndex = Convert.ToInt32(submitData.Split(';')[1].Split(',')[1]);
        string[] searchParas = submitData.Split(';')[2].Split(',');
        string sqlWhere = string.Empty;
        if (searchParas[0] != "")
        {
            sqlWhere += " and  ability_code like @code";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and ability_title like @title";
        }
        SqlParameter[] paras =
            {
                new SqlParameter("@code","%"+searchParas[0]+"%"),
                new SqlParameter("@title","%"+searchParas[1]+"%")
            };
        string tableName = "sys_ability";
        string indexName = "ability_code";
        //*****************************修改内容end******************************
        string countSql = @"select count(1) from " + tableName + " where 1=1 " + sqlWhere;
        string sql = @"select * from (select row_number()over(ORDER BY "+indexName+") AS rownumber ,* from " + tableName + " where 1=1 "
                    + sqlWhere
                    + " ) T where rownumber between " + (pageSize * (pageIndex - 1) + 1).ToString() + " and " + (pageSize * pageIndex).ToString();
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
}