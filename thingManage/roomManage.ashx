<%@ WebHandler Language="C#" Class="getStudentInfo_test" %>

using System;
using System.Web;
using System.Data;
using System.Web.SessionState;
using System.Data.SqlClient;
using System.Collections.Generic;

public class getStudentInfo_test : IHttpHandler, IReadOnlySessionState
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
            case "LOAD_INFO":
                result = loadInfo(submitData);
                break;
            case "UPDATE":
                result = updateInfo(submitData);
                break;
            case "DELETE":
                result = deleteStudent(submitData);
                break;
            case "INSERT":
                result = insertInfo(submitData);
                break;
            case "BOOK":
                result = roomBook(submitData, account);
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

    //加载表格信息
    //submitData格式：LOAD;pageSize，pageIndex;searchPara1，searchPara2，searchPara3...
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
            sqlWhere += " and room_name like @roomName";
        }
        if (searchParas[2] != "")
        {
            sqlWhere += " and academy_code=@academyCode";
        }
        if (searchParas[3] != "")
        {
            sqlWhere += " and room_type=@roomType";
        }
        //定义参数数组
        SqlParameter[] paras =
            {
                new SqlParameter("@roomCode","%"+searchParas[0]+"%"),
                new SqlParameter("@roomName","%"+searchParas[1]+"%"),
                new SqlParameter("@academyCode",searchParas[2]),
                new SqlParameter("@roomType",searchParas[3]),
            };
        string tableName = "view_room_info";
        string indexNmae = "room_idx";
        string countSql = @"select count(1) from " + tableName + " where room_delete = 0 " + sqlWhere;
        string sql = @"select * from (select row_number()over(ORDER BY " + indexNmae + ") AS rownumber ,* from " + tableName + " where room_delete = 0 "
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

    //加载单条数据
    public string loadInfo(string submitData)
    {
        string roomIdx = submitData.Split(';')[1];
        string sql = "select * from data_room where room_idx=@idx";
        SqlParameter[] paras =
            {
                new SqlParameter("@idx", roomIdx),
            };
        DataTable dt = m_con.doSql(sql, paras);
        string result = "0";
        if (dt.Rows.Count == 1)
        {
            result = ConventDataTableToJson.Serialize(dt);
        }
        return result;
    }

    //删除
    public string deleteStudent(string submitData)
    {
        string roomIdx = submitData.Split(';')[1];
        string sql = @"update data_room set room_delete = 1 where room_idx = @idx";
        SqlParameter[] paras = { new SqlParameter("@idx", roomIdx), };
        string result = m_con.exSql(sql, paras).ToString() == "1" ? "删除成功！" : "0";
        return result;
    }

    //更新
    public string updateInfo(string submitData)
    {
        string roomIdx = submitData.Split(';')[1];
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[2].Split(',');
        // 1. 定义sql语句
        string sql = @"update data_room set room_code=@code,room_name=@name,academy_code=@academy,room_type=@type,room_update=getDate() where room_idx = @idx";
        // 2. 定义传入的param数组
        SqlParameter[] paras =
        {
                new SqlParameter("@code",data[0]),
                new SqlParameter("@name",data[1]),
                new SqlParameter("@academy",data[2]),
                new SqlParameter("@type",data[3]),
                new SqlParameter("@idx",roomIdx),
        };
        // 3.将sql语句和param数组传入执行函数进行执行，根据执行结果返回提示信息或0。
        string result = m_con.exSql(sql, paras).ToString() == "1" ? "更新成功！" : "0";
        return result;
    }

    //插入 
    public string insertInfo(string submitData)
    {
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[1].Split(',');
        string sql = @"Insert into data_room (room_code,room_name,academy_code,room_type) VALUES(@code,@name,@academy,@type)";
        SqlParameter[] paras =
            {
                new SqlParameter("@code",data[0]),
                new SqlParameter("@name",data[1]),
                new SqlParameter("@academy",data[2]),
                new SqlParameter("@type",data[3]),
            };

        string result = m_con.exSql(sql, paras).ToString() == "1" ? "新增成功！" : "0";
        return result;
    }

    public string roomBook(string submitData, Account account)
    {
        string applyTeacherIdx = account.account_link_idx;
        string roomIdx = submitData.Split(';')[1];
        string[] data = submitData.Split(';')[2].Split(',');
        string sql = "insert into data_room_book (room_idx,book_day,book_start_time,book_end_time,apply_teacher_idx,apply_time,book_status) " +
            "VALUES(@roomIdx,@day,@startTime,@endTime,@applyIdx,getDate(),0)";
        SqlParameter[] paras =
            {
                new SqlParameter("@roomIdx",roomIdx),
                new SqlParameter("@day",data[2]),
                new SqlParameter("@startTime",data[3]),
                new SqlParameter("@endTime",data[4]),
                new SqlParameter("@applyIdx",applyTeacherIdx),
            };
        return SQLServerDBHelp.exSql(sql,paras).ToString() == "1"? "提交成功！" : "0";
    }
}   