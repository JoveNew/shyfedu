<%@ WebHandler Language="C#" Class="deviceManage" %>

using System;
using System.Web;
using System.Data;
using System.Web.SessionState;
using System.Data.SqlClient;
using System.Collections.Generic;




public class deviceManage : IHttpHandler,IReadOnlySessionState
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
                result = deleteInfo(submitData);
                break;
            case "INSERT":
                result = insertInfo(submitData);
                break;
            case "REPAIR":
                result = repairDevice(submitData, account);
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
            sqlWhere += " and device_code like @deviceCode";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and device_name like @deviceName";
        }
        if (searchParas[2] != "")
        {
            sqlWhere += " and academy_code like @academyCode";
        }
        if (searchParas[3] != "")
        {
            sqlWhere += " and device_state=@deviceState";
        }
        //定义参数数组
        SqlParameter[] paras =
            {
                new SqlParameter("@deviceCode","%"+searchParas[0]+"%"),
                new SqlParameter("@deviceName","%"+searchParas[1]+"%"),
                new SqlParameter("@academyCode","%"+searchParas[2]+"%"),
                new SqlParameter("@deviceState",searchParas[3]),
            };
        string tableName = "view_device_info";
        string indexNmae = "device_idx";
        string countSql = @"select count(1) from " + tableName + " where device_delete = 0 " + sqlWhere;
        string sql = @"select * from (select row_number()over(ORDER BY " + indexNmae + ") AS rownumber ,* from " + tableName + " where device_delete = 0 "
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
        string deviceIdx = submitData.Split(';')[1];
        string sql = "select * from data_device where device_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", deviceIdx), };
        DataTable dt = m_con.doSql(sql, paras);
        string result = "0";
        if (dt.Rows.Count == 1)
        {
            result = ConventDataTableToJson.Serialize(dt);
        }
        return result;
    }

    //删除
    public string deleteInfo(string submitData)
    {
        string deviceIdx = submitData.Split(';')[1];
        string sql = @"update data_device set device_delete = 1 where device_idx = @idx";
        SqlParameter[] paras = { new SqlParameter("@idx", deviceIdx), };
        string result = m_con.exSql(sql, paras).ToString() == "1" ? "删除成功！" : "0";
        return result;
    }

    //更新
    public string updateInfo(string submitData)
    {
        string deviceIdx = submitData.Split(';')[1];
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[2].Split(',');
        string time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        // 1. 定义sql语句
        string sql = @"update data_device set device_code=@deviceCode,device_name=@name,academy_code=@academyCode,room_idx=@roomIdx,device_type=@type,device_num=@num,device_state=@state,device_update=@update where device_idx = @deviceIdx";
        // 2. 定义传入的param数组
        SqlParameter[] paras =
        {
                new SqlParameter("@deviceCode",data[0]),
                new SqlParameter("@name",data[1]),
                new SqlParameter("@academyCode",data[2]),
                new SqlParameter("@roomIdx",data[3]),
                new SqlParameter("@type",data[4]),
                new SqlParameter("@num",data[5]),
                new SqlParameter("@state",data[6]),
                new SqlParameter("@update",time),
                new SqlParameter("@deviceIdx",deviceIdx),
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
        string time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

        string sql = @"Insert into data_device (device_code,device_name,academy_code,room_idx,device_type,device_num,device_state,device_update,device_create,device_delete) VALUES(@device_code,@device_name,@academy_code,@room_idx,@device_type,@device_num,@device_state,@device_update,@device_create,@device_delete)";
        SqlParameter[] paras =
            {
                new SqlParameter("@device_code",data[0]),
                new SqlParameter("@device_name",data[1]),
                new SqlParameter("@academy_code",data[2]),
                new SqlParameter("@room_idx",data[3]),
                new SqlParameter("@device_type",data[4]),
                new SqlParameter("@device_num",data[5]),
                new SqlParameter("@device_state",data[6]),
                new SqlParameter("@device_update",time),
                new SqlParameter("@device_create",time),
                //注意：当传入int 0时需进行类型转换，否则0会被当做default参数，从而报错，此处的0本可以直接在sql中写明，为了提醒使用者特此声明
                new SqlParameter("@device_delete",Convert.ToInt32(0)),
            };
        string result = m_con.exSql(sql, paras).ToString() == "1" ? "新增成功！" : "0";
        return result;
    }

    //设备报修
    public string repairDevice(string submitData, Account account)
    {
        string deviceIdx = submitData.Split(';')[1];
        string teacherIdx = account.account_idx.ToString();
        string updateSql = "update data_device set device_state = 'R',device_update=getDate() where device_idx =" + deviceIdx;
        string insertSql = "insert into data_device_repair (device_idx,account_idx,repair_num,repair_state) VALUES('" + deviceIdx + "','" + teacherIdx + "','" + 1 + "','" + 0 + "')";
        List<string> exSqlList = new List<string>();
        exSqlList.Add(updateSql);
        exSqlList.Add(insertSql);
        SQLServerDBHelp.exSql(exSqlList);
        return "报修成功";
    }

}