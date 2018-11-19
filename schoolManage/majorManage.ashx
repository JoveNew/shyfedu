<%@ WebHandler Language="C#" Class="majorManage" %>

using System;
using System.Web;
using System.Data;
using System.Data.SqlClient;

public class majorManage : IHttpHandler {

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
            case "UNDELETE":
                result = undelete(submitData);
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
        int pageSize = Convert.ToInt32(submitData.Split(';')[1].Split(',')[0]);
        int pageIndex = Convert.ToInt32(submitData.Split(';')[1].Split(',')[1]);
        string[] searchParas = submitData.Split(';')[2].Split(',');
        string sqlWhere = string.Empty;
        if (searchParas[0] != "")
        {
            sqlWhere += " and  major_code like @code";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and major_name like @name";
        }
        if (searchParas[2] != "null")
        {
            sqlWhere += " and major_delete= @delete";
        }
        SqlParameter[] paras =
            {
                new SqlParameter("@code","%"+searchParas[0]+"%"),
                new SqlParameter("@name","%"+searchParas[1]+"%"),
                new SqlParameter("@delete",searchParas[2])
            };
        string tableName = "dict_major_info";
        string indexName = "major_delete asc,major_code";
        //*****************************修改内容end******************************
        string countSql = @"select count(1) from " + tableName + " where 1=1 " + sqlWhere;
        string sql = @"select * from (select row_number()over(ORDER BY " + indexName + ") AS rownumber ,* from " + tableName + " where 1=1 "
            + sqlWhere
            + " ) T where rownumber between " + (pageSize * (pageIndex - 1) + 1).ToString() + " and " + (pageSize * pageIndex).ToString();
        //获取总行数
        int total = SQLServerDBHelp.exNumberSql(countSql,paras);
        //if (total == 0) return "0";
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
        string code = submitData.Split(';')[1];
        string sql = "select * from dict_major_info where major_code=@code";
        SqlParameter[] paras = { new SqlParameter("@code", code) };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        //if (dt.Rows.Count != 1) return "0";
        return ConventDataTableToJson.Serialize(dt);
    }

    //更新
    public string update(string submitData)
    {
        string code = submitData.Split(';')[1];
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[2].Split(',');
        string sql = @"update dict_major_info set major_code=@upcode,major_name=@name,major_update=getdate() 
                     where major_code=@code";
        SqlParameter[] paras =
        {
            new SqlParameter("@upcode",data[0]),
            new SqlParameter("@name",data[1]),
            new SqlParameter("@code",code)
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "更新成功！" : "0";
    }

    public string delete(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = @"update dict_major_info set major_delete =1,major_update=getdate() where major_code=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx), };
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "成功停用！" : "0";
    }

    public string undelete(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = @"update dict_major_info set major_delete =0,major_update=getdate() where major_code=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx), };
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "成功启用！" : "0";
    }

    //插入
    public string insert(string submitData)
    {
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[1].Split(',');
        string sql = @"Insert into dict_major_info (major_code,major_name) VALUES(@code,@name)";
        SqlParameter[] paras =
        {
            new SqlParameter("@code",data[0]),
            new SqlParameter("@name",data[1]),
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "新增成功！" : "0";
    }
}