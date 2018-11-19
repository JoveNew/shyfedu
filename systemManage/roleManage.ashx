<%@ WebHandler Language="C#" Class="roleManage" %>

using System;
using System.Web;
using System.Data;
using System.Data.SqlClient;

public class roleManage : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        string submitData = context.Request.Form["submitData"];
        string opt = submitData.Split(';')[0];
        string result = "";
        switch (opt)
        {
            case "LOAD_LIST":
                result = loadList(submitData);
                break;
            case "INSERT":
                result = insertList(submitData);
                break;
            case "DELETE":
                result = deleteList(submitData);
                break;
            case "ROLE_SELECT":
                result = getRoleSelect();
                break;
            case "ABILITY_SELECT":
                result = getAbilitySelect();
                break;
        }
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
        if (searchParas[0] != "null")
        {
            sqlWhere += " and  role_type=@roleType";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and  ability_title like @abilityTitle";
        }
        SqlParameter[] paras =
            {
                new SqlParameter("@roleType",searchParas[0]),
                new SqlParameter("@abilityTitle","%"+searchParas[1]+"%")
            };
        string tableName = "view_role_ability";
        string indexName = "role_type,ability_code";
        //*****************************修改内容end******************************
        string countSql = @"select count(1) from " + tableName + " where 1=1 " + sqlWhere;
        string sql = @"select * from (select row_number()over(ORDER BY "+indexName+") AS rownumber ,* from " + tableName + " where 1=1 "
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

    public string deleteList(string submitData)
    {
        string role_type = submitData.Split(';')[1].Split(',')[0];
        string ability_code = submitData.Split(';')[1].Split(',')[1];
        string sql = @"delete from sys_role_ability where role_type=@role_type and ability_code=@ability_code ";
        SqlParameter[] paras = { new SqlParameter("@role_type", role_type),new SqlParameter("@ability_code", ability_code), };
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "删除成功！" : "0";
    }

    public string insertList(string submitData)
    {
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[1].Split(',');
        string sql = @"Insert into sys_role_ability (role_type,ability_code) 
                       VALUES(@type,@code)";
        SqlParameter[] paras =
        {
            new SqlParameter("@type",data[0]),
            new SqlParameter("@code",data[1])
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "新增成功！" : "0";
    }

    string getRoleSelect()
    {
        string sql = "select role_type,role_name from sys_role";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string result = ConventDataTableToJson.Serialize(dt);
        return result;
    }

    string getAbilitySelect()
    {
        string sql = "select ability_code,ability_title from sys_ability";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string result = ConventDataTableToJson.Serialize(dt);
        return result;
    }
}