<%@ WebHandler Language="C#" Class="roomBookManage" %>

using System;
using System.Web;
using System.Data;
using System.Web.SessionState;
using System.Data.SqlClient;
using System.Collections.Generic;

public class roomBookManage : IHttpHandler, IReadOnlySessionState
{
    private SQLConnection m_con = new SQLConnection();
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        Account account = (Account)HttpContext.Current.Session["account"];
        if (account == null)
        {
            context.Response.Write("当前为无登录状态");
        }
        //获取操作类型
        string submitData = context.Request.Form["submitData"] == null ? "NULL" : context.Request.Form["submitData"];
        string option = submitData.Split(';')[0];
        string result = "";
        switch (option)
        {
            case "LOAD_LIST":
                result = loadList(submitData);
                break;
            case "AGREE":
                result = applyAgree(submitData);
                break;
            case "REJECT":
                result = applyReject(submitData);
                break;
            case "NULL":
                result = "提交数据为空";
                break;
        }
        //插入更新删除成功返回相应的提示数据，失败均返回0，获取列表和获取学生信息成功返回相应数据
        context.Response.Write(result);
    }
    //接口函数实现
    public bool IsReusable
    {
        get
        {
            return false;
        }
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
        if (searchParas[0] != "")
        {
            sqlWhere += " and room_code like @roomCode";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and academy_code = @academyCode";
        }
        if (searchParas[2] != "")
        {
            sqlWhere += " and book_status=@bookStatus";
        }
        //定义参数数组
        SqlParameter[] paras =
            {
                new SqlParameter("@roomCode","%"+searchParas[0]+"%"),
                new SqlParameter("@academyCode",searchParas[1]),
                new SqlParameter("@bookStatus",searchParas[2]),
            };
        string tableName = "view_room_book_info";
        string indexNmae = "book_idx";
        string countSql = @"select count(1) from " + tableName + " where room_book_delete = 0 " + sqlWhere;
        string sql = @"select * from (select row_number()over(ORDER BY " + indexNmae + ") AS rownumber ,* from " + tableName + " where room_book_delete = 0 "
            + sqlWhere
            + " ) T where rownumber between " + (pageSize * (pageIndex - 1) + 1).ToString() + " and " + (pageSize * pageIndex).ToString();
        //获取总行数
        int total = SQLServerDBHelp.exNumberSql(countSql, paras);
        //获取表数据
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        //将数据json化
        string jsonstr = ConventDataTableToJson.Serialize(dt);
        //格式打包
        string result = getFinalJson(total, jsonstr);
        //返回结果
        return result;
    }

    //对返回的内容进行包装，获得最终返回给前端的json格式数据
    string getFinalJson(int total, string jsonstr)
    {
        return "{\"total\":" + total + ",\"rows\":" + jsonstr + "}";
    }

    //同意申请
    public string applyAgree(string submitData)
    {
        string bookIdx = submitData.Split(';')[1];
        string sql = "update data_room_book set book_status = '1',check_time = getDate(),room_book_update = getDate() where book_idx = @idx" ;
        SqlParameter[] paras =
        {
                new SqlParameter("@idx",bookIdx),
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "审核成功" : "0";
    }

    //拒绝申请
    public string applyReject(string submitData)
    {
        string bookIdx = submitData.Split(';')[1];
        string sql = "update data_room_book set book_status = '2',check_time = getDate(),room_book_update=getDate() where book_idx = @idx";
        SqlParameter[] paras =
        {
            new SqlParameter("@idx",bookIdx),
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "审核成功" : "0";
    }

}