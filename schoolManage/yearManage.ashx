<%@ WebHandler Language="C#" Class="yearManage" %>

using System;
using System.Web;
using System.Data;
using System.Data.SqlClient;

public class yearManage : IHttpHandler {

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
            case "INSERT":
                result = insert(submitData);
                break;
            case "BUILD":
                result = build(submitData);
                break;
            case "CURRENT":
                result = setCurrent(submitData);
                break;
            case "FINISH":
                result = setFinish(submitData);
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
        string[] searchParas = submitData.Split(';')[2].Split(',');
        string sqlWhere = string.Empty;
        if (searchParas[0] != "")
        {
            sqlWhere += " and year_code like @code";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and year_name like @name";
        }
        SqlParameter[] paras =
            {
                new SqlParameter("@code","%"+searchParas[0]+"%"),
                new SqlParameter("@name","%"+searchParas[1]+"%")
            };
        string tableName = "dict_year_info";
        //*****************************修改内容end******************************
        string countSql = @"select count(1) from " + tableName + " where 1=1 " + sqlWhere;
        string sql = @"select * from " + tableName + " where 1=1 " + sqlWhere;
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

    public string insert(string submitData)
    {
        string[] data = submitData.Split(';')[1].Split(',');
        string sql = @"Insert into dict_year_info (year_code,year_name,year_status) VALUES(@code,@name,@status)";
        SqlParameter[] paras =
        {
            new SqlParameter("@code",data[0]),
            new SqlParameter("@name",data[1]),
            new SqlParameter("@status",data[2]),
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "新增成功！" : "0";
    }

    public string build(string submitData)
    {
        string data = submitData.Split(';')[1];
        SqlParameter[] paras =
        {
            new SqlParameter("@year_code",data)
        };

        var result = SQLServerDBHelp.exProcess("pro_build_subject", paras);
        return "保存成功！";
    }

    //设为当前学期
    public string setCurrent(string submitData)
    {
        string data = submitData.Split(';')[1];
        string sql = @"update dict_year_info set year_status=@status,year_update=getdate() where year_code=@data";
        SqlParameter[] paras =
        {
            new SqlParameter("@data",data),
            new SqlParameter("@status","C"),
        };
        string judgeStr = @"select count(1) from dict_year_info where year_status=@status";
        SqlParameter[] judgeParas =
        {
            new SqlParameter("@status","C"),
        };
        int num = SQLServerDBHelp.exNumberSql(judgeStr,judgeParas);
        if (num == 0)
            return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "修改成功！" : "0";
        else
            return "仅能设置一个当前学期！";
    }

    //设为结束学期
    public string setFinish(string submitData)
    {
        string data = submitData.Split(';')[1];
        string sql = @"update dict_year_info set year_status=@status,year_update=getdate() where year_code=@data";
        SqlParameter[] paras =
        {
            new SqlParameter("@data",data),
            new SqlParameter("@status","F"),
        };
        return SQLServerDBHelp.exSql(sql,paras).ToString() == "1" ? "修改成功！" : "0";
    }
}