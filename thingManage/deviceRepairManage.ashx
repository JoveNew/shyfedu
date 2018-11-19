<%@ WebHandler Language="C#" Class="deviceRepaiManage" %>

using System;
using System.Web;
using System.Data;
using System.Web.SessionState;
using System.Data.SqlClient;
using System.Collections.Generic;

public class deviceRepaiManage : IHttpHandler,IReadOnlySessionState
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
            case "COMPLETE":
                result = repairComplete(submitData, account);
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
            sqlWhere += " and academy_code=@academyCode";
        }
        if (searchParas[3] != "")
        {
            sqlWhere += " and repair_state=@repairState";
        }
        //定义参数数组
        SqlParameter[] paras =
            {
                new SqlParameter("@deviceCode","%"+searchParas[0]+"%"),
                new SqlParameter("@deviceName","%"+searchParas[1]+"%"),
                new SqlParameter("@academyCode",searchParas[2]),
                new SqlParameter("@repairState",searchParas[3]),
            };
        string tableName = "view_device_repair_info";
        string indexNmae = "device_repair_idx";
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

    //设备维修完成
    public string repairComplete(string submitData, Account account)
    {
        string deviceIdx = submitData.Split(';')[1];
        string updateDataDevice = "update data_device set device_state = 'U',device_update=getDate() where device_idx =" + deviceIdx;
        string updateDataDeviceRepair = "update data_device_repair set repair_state = '1',device_update=getDate() where device_idx =" + deviceIdx;
        List<string> exSqlList = new List<string>();
        exSqlList.Add(updateDataDevice);
        exSqlList.Add(updateDataDeviceRepair);
        SQLServerDBHelp.exSql(exSqlList);
        return "维修成功";
    }


}