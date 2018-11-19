/*
作者：qianqi
创建日期：2018.9.19
文档说明：

*/

<%@ WebHandler Language="C#" Class="classManage" %>

using System;
using System.Web;
using System.Data;
using System.Text;
using System.Data.SqlClient;
using System.IO;
using System.Collections.Generic;

public class classManage : IHttpHandler
{
    //接口函数实现
    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
    public void ProcessRequest (HttpContext context)
    {
        context.Response.ContentType = "text/plain";

        //获取操作类型
        string submitData =context.Request.Form["submitData"];
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
            case "INSERT":
                result = insert(submitData);
                break;
            case "SELECTGROUP":
                result = loadSelectOptgroup(submitData);
                break;
            case "ADDABCLASS":
                result = addABClass(submitData);
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
            sqlWhere += " and class_code like @code";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and class_name like @name";
        }
        //定义参数数组
        SqlParameter[] paras =
            {
                new SqlParameter("@code","%"+searchParas[0]+"%"),
                new SqlParameter("@name","%"+searchParas[1]+"%"),
            };
        string tableName = "view_class_info";
        string indexNmae = "class_name";
        //*****************************修改内容end******************************
        string countSql = @"select count(1) from "+tableName+" where 1=1 " + sqlWhere;
        string sql = @"select * from (select row_number()over(ORDER BY "+indexNmae+") AS rownumber ,* from " + tableName + " where 1=1 "
            + sqlWhere
            + " ) T where rownumber between " + (pageSize * (pageIndex - 1) + 1).ToString() + " and " + (pageSize * pageIndex).ToString();
        //获取总行数
        int total = SQLServerDBHelp.exNumberSql(countSql,paras);
        if (total == 0) return "0";
        //获取表数据
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
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


    //加载单条数据
    public string loadInfo(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = "select * from view_class_info where class_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx) };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        if (dt.Rows.Count != 1) return "0";
        return ConventDataTableToJson.Serialize(dt);
    }

    //删除
    public string delete(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = @"update data_class set class_delete =1,class_update=getdate() where class_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx), };
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "删除成功！" : "0";
    }

    //更新
    public string update(string submitData)
    {
        string idx = submitData.Split(';')[1];
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[2].Split(',');
        string sql = @"update data_class set class_code=@code,class_name=@name,
            major_code=@major,academy_code=@academy,class_update=getdate() where class_idx=@idx";
        SqlParameter[] paras =
        {
            new SqlParameter("@code",data[0]),
            new SqlParameter("@name",data[1]),
            new SqlParameter("@major",data[2]),
            new SqlParameter("@academy",data[3]),
            new SqlParameter("@idx",idx)
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "更新成功！" : "0";
    }

    //插入
    public string insert(string submitData)
    {
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[1].Split(',');
        string sql = @"Insert into data_class (class_code,class_name,major_code,academy_code) 
            VALUES(@code,@name,@major,@academy)";
        SqlParameter[] paras =
        {
            new SqlParameter("@code",data[0]),
            new SqlParameter("@name",data[1]),
            new SqlParameter("@major",data[2]),
            new SqlParameter("@academy",data[3]),
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "新增成功！" : "0";
    }

    //载入下拉框组
    public string loadSelectOptgroup(string submitData)
    {
        string sql = "select * from view_academy_info";
        var data = "";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        if (dt.Rows.Count > 0)
        {
            data = ConventDataTableToJson.Serialize(dt);
        }
        return data;
    }

    public string addABClass(string submitData)
    {
        string classIdx = submitData.Split(';')[1];
        string sql1 = "insert into data_class(class_code,class_name,major_code,academy_code,link_class_type,link_class_idx) select class_code,class_name+'(A)' as class_name, major_code,academy_code,'1'," + classIdx + " from data_class where class_idx = '" + classIdx + "'";
        string sql2 = "insert into data_class(class_code,class_name,major_code,academy_code,link_class_type,link_class_idx) select class_code,class_name+'(B)' as class_name, major_code,academy_code,'1'," + classIdx + " from data_class where class_idx = '" + classIdx + "'";
        List<string> sql = new List<string> { sql1,sql2 };
        SQLServerDBHelp.exSql(sql);
        return "添加完成！";
    }
}