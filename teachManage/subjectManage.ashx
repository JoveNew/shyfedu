/*
作者：lixiaowen 
创建日期：2018.8.30
文档说明：
根据网页请求的命令，从数据库获取设备信息数据。转换成JSON格式，返回给网页处理。*/

<%@ WebHandler Language="C#" Class="subjectManage" %>

using System;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Web.SessionState;

public class subjectManage : IHttpHandler,IReadOnlySessionState
{
    public void ProcessRequest (HttpContext context)
    {
        context.Response.ContentType = "text/plain";

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
                result = delete(submitData);
                break;
            case "INSERT":
                result = insertInfo(submitData);
                break;
            case "subject_type":
                result = subjectTypeList();
                break;
            case "teacher_idx":
                result = teacherList();
                break;
            case "room_idx":
                result = roomList();
                break;
            case "year_code":
                result = yearList();
                break;
            case "class_idx":
                result = classList();
                break;
            case "score_group_code":
                result = scoreGroupList();
                break;
            case "NULL":
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


    //加载所有信息，用于表格初始化
    //submitData格式：LOAD;pageSize，pageIndex;searchPara1，searchPara2，searchPara3...
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
            sqlWhere += " and subject_code like @code";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and subject_name like @name";
        }
        if (searchParas[2] != "")
        {
            sqlWhere += " and class_idx=@idx";
        }
        if (searchParas[3] != "")
        {
            sqlWhere += " and subject_type=@type";
        }
        if (searchParas[4] != "")
        {
            sqlWhere += " and year_code=@year";
        }
        Account account = (Account)HttpContext.Current.Session["account"];
        if (account.role_type == "T")
        {
            sqlWhere += " and (teacher_idx1="+account.account_link_idx+" or teacher_idx2="+account.account_link_idx+")";
        }
        else if (account.role_type == "S")
        {
            sqlWhere += @" and class_idx in (select class_idx from data_student where student_idx="+account.account_link_idx
                    +" union select link_class_idx from data_student where student_idx="+account.account_link_idx+")";
        }
        else if (account.role_type == "E")
        {
            sqlWhere += " and score_group_code in (select score_group_code from data_score_group_manage where account_idx="+account.account_idx+" )";
        }
        //定义参数数组
        SqlParameter[] paras =
            {
                new SqlParameter("@code","%"+searchParas[0]+"%"),
                new SqlParameter("@name","%"+searchParas[1]+"%"),
                new SqlParameter("@idx",searchParas[2]),
                new SqlParameter("@type",searchParas[3]),
                new SqlParameter("@year",searchParas[4]),
            };
        string tableName = "view_subject_info";
        string indexName = "subject_idx";
        //*****************************修改内容end******************************
        string countSql = @"select count(1) from "+tableName+" where 1=1 " + sqlWhere;
        string sql = @"select * from (select row_number()over(ORDER BY "+indexName+") AS rownumber ,* from " + tableName + " where 1=1 "
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

    //对返回的内容进行包装，获得最终返回给前端的JSON格式数据
    string getFinalJson(int total, string jsonstr)
    {
        return "{\"total\":" + total + ",\"rows\":" + jsonstr + "}";
    }

    //加载单条数据
    public string loadInfo(string submitData)
    {
        string subjectIdx = submitData.Split(';')[1];
        string sql = "select * from data_subject where subject_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", subjectIdx), };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        string result = "0";
        if (dt.Rows.Count == 1)
        {
            result = ConventDataTableToJson.Serialize(dt);
        }
        return result;
    }

    //删除
    public string delete(string submitData)
    {
        string subjectIdx = submitData.Split(';')[1];
        string sql = @"update data_subject set subject_delete =1 where subject_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", subjectIdx), };
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "删除成功！" : "0";
    }

    //更新
    public string updateInfo(string submitData)
    {
        string subjectIdx = submitData.Split(';')[1];
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[2].Split(',');
        for (int i = 0; i< data.Length; i++)
        {
            if (data[i] == "null")
                data[i] = "";
        }
        // 1. 定义sql语句
        string sql = @"update data_subject set subject_code=@code,subject_type=@subtype,teacher_idx1=@teacher1,room_idx=@room,subject_score_type=@subscotype,subject_name=@name,year_code=@year,teacher_idx2=@teacher2,class_idx=@class,score_group_code=@scogrocode,subject_update=getDate() where subject_idx=@idx";
        // 2. 定义传入的param数组        
        SqlParameter[] paras =
        {
            new SqlParameter("@code",data[0]),
            new SqlParameter("@subtype", data[1]),
            new SqlParameter("@teacher1",data[2]),
            new SqlParameter("@room",data[3]),
            new SqlParameter("@subscotype",data[4]),
            new SqlParameter("@name",data[5]),
            new SqlParameter("@year",data[6]),
            new SqlParameter("@teacher2",data[7]),
            new SqlParameter("@class",data[8]),
            new SqlParameter("@scogrocode",data[9]),
            new SqlParameter("@idx",subjectIdx),
        };
        // 3.将sql语句和param数组传入执行函数进行执行，根据执行结果返回提示信息或0。
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "更新成功！" : "0";
    }

    //插入
    public string insertInfo(string submitData)
    {
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[1].Split(',');
        for (int i = 0; i< data.Length; i++)
        {
            if (data[i] == "null")
                data[i] = "";
        }
        string subjectSql = @"Insert into data_subject (subject_code,subject_type,teacher_idx1,room_idx,subject_score_type,
        subject_name,year_code,teacher_idx2,class_idx,score_group_code) 
        VALUES(@code,@subtype,@teacher1,@room,@subscotype,@name,@year,@teacher2,@class,@scogrocode)";
        SqlParameter[] subjectParas =
        {
           new SqlParameter("@code",data[0]),
            new SqlParameter("@subtype", data[1]),
            new SqlParameter("@teacher1",data[2]),
            new SqlParameter("@room",data[3]),
            new SqlParameter("@subscotype",data[4]),
            new SqlParameter("@name",data[5]),
            new SqlParameter("@year",data[6]),
            new SqlParameter("@teacher2",data[7]),
            new SqlParameter("@class",data[8]),
            new SqlParameter("@scogrocode",data[9]),
        };
        return SQLServerDBHelp.exSql(subjectSql, subjectParas) > 1 ? "新增成功！" : "0";
    }
    //下拉框数据采集
    public string subjectTypeList()
    {
        string sql = "select subject_type,subject_type_name from dict_subject_type";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string data = ConventDataTableToJson.Serialize(dt);
        return data;
    }

    public string teacherList()
    {
        string sql = "select teacher_idx,teacher_name from view_teacher_info";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string data = ConventDataTableToJson.Serialize(dt);
        return data;
    }

    public string roomList()
    {
        string sql = "select room_idx,room_name from data_room where room_delete=0";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string data = ConventDataTableToJson.Serialize(dt);
        return data;
    }

    public string yearList()
    {
        string sql = "select year_code,year_name,year_status from dict_year_info where year_delete=0";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string data = ConventDataTableToJson.Serialize(dt);
        return data;
    }

    public string classList()
    {
        string sql = "select class_idx,class_name from data_class where class_delete=0";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string data = ConventDataTableToJson.Serialize(dt);
        return data;
    }

    public string scoreGroupList()
    {
        string sql = "select score_group_code,score_group_name from dict_score_group";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string data = ConventDataTableToJson.Serialize(dt);
        return data;
    }

    //public string sumScore(string submitData)
    //{
    //    return "汇总成功！";
    //}
}

