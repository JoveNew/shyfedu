<%@ WebHandler Language="C#" Class="perfectProjectManage" %>

using System;
using System.Web;
using System.Data;
using System.Web.SessionState;
using System.Data.SqlClient;
using System.Collections.Generic;

public class perfectProjectManage : IHttpHandler, IReadOnlySessionState
{

    //接口函数实现
    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        Account account = (Account)HttpContext.Current.Session["account"];
        if (account == null)
        {
            context.Response.Write("当前为无登录状态");
        }
        //获取操作类型
        string submitData = context.Request.Form["submitData"] == "null" ? "null;" : context.Request.Form["submitData"];
        HttpFileCollection files = context.Request.Files;
        string option = files.Count > 0 ? "UPLOAD_PROJECT" : submitData.Split(';')[0];
        string result = "";
        switch (option)
        {
            case "LOAD_LIST":
                result = loadList(submitData);
                break;
            case "DELETE":
                result = delete(submitData);
                break;
            case "GET_DOWNLOAD_URL":
                result = getDownloadUrl(submitData);
                break;
            case "SHOWON":
                result = showOn(submitData);
                break;
            case "SHOWOFF":
                result = showOff(submitData);
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

    /// <summary>
    /// 列表查询
    /// </summary>
    /// <param name="submitData">格式：LOAD;pageSize，pageIndex;searchPara1，searchPara2，searchPara3...</param>
    /// <returns></returns>
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
            sqlWhere += " and student_name=@studentName";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and perfect_project_name=@projectName";
        }
        if (searchParas[2] != "")
        {
            sqlWhere += " and subject_name=@subjectName";
        }
        if (searchParas[3] != "")
        {
            sqlWhere += " and home_page_flag=@homePageFlag";
        }
        //定义参数数组
        SqlParameter[] paras1 =
            {
                new SqlParameter("@studentName",searchParas[0]),
                new SqlParameter("@projectName",searchParas[1]),
                new SqlParameter("@subjectName",searchParas[2]),
                new SqlParameter("@homePageFlag",searchParas[3]),
            };
        SqlParameter[] paras2 =
            {
                new SqlParameter("@studentName",searchParas[0]),
                new SqlParameter("@projectName",searchParas[1]),
                new SqlParameter("@subjectName",searchParas[2]),
                new SqlParameter("@homePageFlag",searchParas[3]),
            };
        string tableName = "view_perfect_project_info";
        string indexName = "perfect_project_idx";
        //*****************************修改内容end******************************
        string countSql = @"select count(1) from " + tableName + " where perfect_project_delete = 0 " + sqlWhere;
        string sql = @"select * from (select row_number()over(ORDER BY " + indexName + " desc) AS rownumber ,* from " + tableName + " where perfect_project_delete = 0 "
            + sqlWhere
            + " ) T where rownumber between " + (pageSize * (pageIndex - 1) + 1).ToString() + " and " + (pageSize * pageIndex).ToString();
        //获取总行数
        int total = SQLServerDBHelp.exNumberSql(countSql, paras1);
        if (total == 0) return "0";
        //获取表数据
        DataTable dt = SQLServerDBHelp.doSql(sql, paras2);
        //将数据json化
        string jsonstr = ConventDataTableToJson.Serialize(dt);
        //格式打包
        string result = getFinalJson(total, jsonstr);
        //返回结果
        return result;
    }

    //对返回的内容进行包装，获得最终返回给前端的JSON格式数据
    string getFinalJson(int total, string jsonstr)
    {
        return "{\"total\":" + total + ",\"rows\":" + jsonstr + "}";
    }

    //删除
    public string delete(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = @"update data_perfect_project set perfect_project_delete =1 where perfect_project_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx), };
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "删除成功！" : "0";
    }
    //下载
    public string getDownloadUrl(string submitData)
    {
        string result = "";
        string projectIdx = submitData.Split(';')[1];
        string sql = "select perfect_project_file from data_perfect_project where perfect_project_idx = @projectIdx";
        SqlParameter[] paras =
            {
                new SqlParameter("projectIdx",projectIdx),
    };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        result = dt.Rows[0][0].ToString();
        return result;
    }

    //设为首页展示
    public string showOn(string submitData)
    {
        string projectIdx = submitData.Split(';')[1];
        string sql1 = "update data_perfect_project set home_page_flag = '1',perfect_project_update=getDate() where perfect_project_idx = '"+projectIdx+"'";
        string sql2 = "update data_perfect_project set home_page_flag = '0' where home_page_flag = '1' and perfect_project_idx not in(select TOP 3 perfect_project_idx from data_perfect_project where home_page_flag = '1' order by perfect_project_update desc)";
        List<string> exSqlList = new List<string>();
        exSqlList.Add(sql1);
        exSqlList.Add(sql2);
        SQLServerDBHelp.exSql(exSqlList);
        return "设置成功!";
    }

    //取消首页展示
    public string showOff(string submitData)
    {
        string projectIdx = submitData.Split(';')[1];
        string sql = "update data_perfect_project set home_page_flag = '0' where perfect_project_idx = @idx";
        SqlParameter[] paras =
            {
                new SqlParameter("@idx",projectIdx),
        };
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "设置成功！" : "0";
    }

}