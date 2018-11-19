<%@ WebHandler Language="C#" Class="scoreGroupManage" %>

using System;
using System.Web;
using System.Data;
using System.Text;
using System.Data.SqlClient;


public class scoreGroupManage : IHttpHandler {

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
            case "DELETE":
                result = delete(submitData);
                break;
            case "INSERT":
                result = insert(submitData);
                break;
            case "account_idx":
                result = getAccountSelect();
                break;
            case "score_group_code":
                result = getGroupSelect();
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
            sqlWhere = " and  score_group_name=@groupName";
        }
        //定义参数数组
        SqlParameter[] paras =
            {
                new SqlParameter("@groupName",searchParas[0])
            };
        string tableName = "view_score_group";
        string indexName = "score_group_manage_idx";
        //*****************************修改内容end******************************
        string countSql = @"select count(1) from " + tableName + " where 1=1 " + sqlWhere;
        string sql = @"select * from (select row_number()over(ORDER BY " + indexName + ") AS rownumber ,* from " + tableName + " where 1=1 "
            + sqlWhere
            + " ) T where rownumber between " + (pageSize * (pageIndex - 1) + 1).ToString() + " and " + (pageSize * pageIndex).ToString() + "and score_group_manage_delete= 0";
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

    public string delete(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = @"update data_score_group_manage set score_group_manage_delete = 1,score_group_manage_update=getdate() where score_group_manage_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx), };
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "删除成功！" : "0";
    }

    public string insert(string submitData)
    {
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[1].Split(',');
        string sql = @"Insert into data_score_group_manage (score_group_code,account_idx) 
                       VALUES(@groupCode,@account)";
        SqlParameter[] paras =
        {
            new SqlParameter("@groupCode",data[0]),
            new SqlParameter("@account",data[1]),
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "新增成功！" : "0";
    }

    public string getAccountSelect()
    {
        string sql = "select account_idx,account_name from sys_account where role_type= 'E'";
        return ConventDataTableToJson.Serialize(SQLServerDBHelp.doSql(sql));
    }

    public string getGroupSelect()
    {
        string sql = "select score_group_code,score_group_name from dict_score_group";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        return ConventDataTableToJson.Serialize(dt);
    }
}
