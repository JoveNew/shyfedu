<%@ WebHandler Language="C#" Class="userManage" %>

using System;
using System.Web;
using System.Data;
using System.Text;
using System.Data.SqlClient;

public class userManage : IHttpHandler {

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
            case "UPDATE":
                result = update(submitData);
                break;
            case "DELETE":
                result = delete(submitData);
                break;
            case "ACTIVE":
                result = active(submitData);
                break;
            case "INSERT":
                result = insert(submitData);
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
        if (searchParas[0] != "")
        {
            sqlWhere += " and  account_name like @accountName";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and  link_name like @linkName";
        }
        if (searchParas[2] != "" && searchParas[2] != "null")
        {
            sqlWhere += " and  role_type=@roleType";
        }
        if (searchParas[3] != "" && searchParas[3] != "null")
        {
            sqlWhere += " and  account_delete=@accountDelete";
        }
        //定义参数数组
        SqlParameter[] paras =
            {
                new SqlParameter("@accountName","%"+searchParas[0]+"%"),
                new SqlParameter("@linkName","%"+searchParas[1]+"%"),
                new SqlParameter("@roleType",searchParas[2]),
                new SqlParameter("@accountDelete",searchParas[3]),
            };
        string tableName = "view_account_info";
        string indexName = "account_idx";
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
        string sql = "select account_idx,account_name,account_password,account_link_idx,role_type from view_account_info where account_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx) };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        if (dt.Rows.Count != 1) return "0";
        return ConventDataTableToJson.Serialize(dt);
    }

    public string active(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = @"update sys_account set account_delete =0,account_update=getdate() where  account_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx), };
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "激活成功！" : "0";
    }

    public string delete(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = @"update sys_account set account_delete =1,account_update=getdate() where  account_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx), };
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "冻结成功！" : "0";
    }

    public string update(string submitData)
    {
        string idx = submitData.Split(';')[1];
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[2].Split(',');
        string sql = @"update sys_account set account_name=@name,account_password=@password,
        account_link_idx=@link,role_type=@role,account_delete=@delete,account_update=getdate() where account_idx=@idx";
        SqlParameter[] paras =
        {
            new SqlParameter("@name",data[0]),
            new SqlParameter("@password",data[1]),
            new SqlParameter("@link",data[2]),
            new SqlParameter("@role",data[3]),
            new SqlParameter("@delete",data[4]),
            new SqlParameter("@idx",idx),
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "更新成功！" : "0";
    }

    public string insert(string submitData)
    {
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[1].Split(',');
        string sql = @"Insert into sys_account (account_name,account_password,account_link_idx,role_type,account_delete) 
                       VALUES(@name,@password,@link,@role,@delete)";
        SqlParameter[] paras =
        {
            new SqlParameter("@name",data[0]),
            new SqlParameter("@password",data[1]),
            new SqlParameter("@link",data[2]),
            new SqlParameter("@role",data[3]),
            new SqlParameter("@delete",data[4]),
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "新增成功！" : "0";
    }

    //载入下拉框组
    public string loadSelectOptgroup(string submitData)
    {
        string sql = "select * from view_account_info";
        var data = "";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        if (dt.Rows.Count > 0)
        {
            data = ConventDataTableToJson.Serialize(dt);
        }
        return data;
    }
}