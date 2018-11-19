<%@ WebHandler Language="C#" Class="getSelectList" %>

using System;
using System.Web;
using System.Data;
using System.Text;
using System.Data.SqlClient;
using System.IO;

public class getSelectList : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        //获取操作类型
        string submitData = context.Request.Form["submitData"] == null ? "NULL" : context.Request.Form["submitData"];
        string option = submitData.Split(';')[0];
        string result = "";
        switch (option)
        {
            case "getLessonList":
                result = getLessonList();
                break;
            case "getAcademyList":
                result = getAcademyList();
                break;
            case "getYearList":
                result = getYearList();
                break;
            case "getTeacherList":
                result = getTeacherList();
                break;
            case "getABClassList":
                result = getABClassList(submitData);
                break;
            case "getNoABClassList":
                result = getNoABClassList(submitData);
                break;
            case "getRoomListByAcademy":
                result = getRoomListByAcademy(submitData);
                break;
            case "getMajorList":
                if(submitData.Split(';').Length==2)
                    result = getMajorList(submitData.Split(';')[1]);
                else
                    result = getMajorList();
                break;
            case "getClassList":
                if(submitData.Split(';').Length==2)
                    result = getClassList(submitData.Split(';')[1]);
                else if(submitData.Split(';').Length==3)
                    result = getClassList(null,submitData.Split(';')[2]);
                else
                    result = getClassList();
                break;
            case "getSubjectList":
                result = getSubjectLsit();
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

    public string getLessonList()
    {
        string sql = "select lesson_idx,subject_name from view_lesson_info";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string jsonstr = ConventDataTableToJson.Serialize(dt);
        return jsonstr;
    }

    public string getTeacherList()
    {
        string sql = "select teacher_idx,teacher_name from view_teacher_info";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string jsonstr = ConventDataTableToJson.Serialize(dt);
        return jsonstr;
    }

    public string getYearList()
    {
        string sql = "select year_code,year_name from dict_year_info where year_delete=0 ";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string jsonstr = ConventDataTableToJson.Serialize(dt);
        return jsonstr;
    }

    public string getAcademyList()
    {
        string sql = "select academy_code,academy_name from dict_academy_info where academy_delete = 0";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string jsonstr = ConventDataTableToJson.Serialize(dt);
        return jsonstr;
    }

    public string getRoomListByAcademy(string submitData)
    {
        string academyCode = submitData.Split(';')[1];
        string sql = "select room_idx,room_code from data_room where academy_code = @code and room_delete = 0";
        SqlParameter[] paras =
            {
                new SqlParameter("code",academyCode),
            };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        string jsonstr = ConventDataTableToJson.Serialize(dt);
        return jsonstr;
    }

    public string getMajorList(string academy_code=null)
    {
        string sql = "select major_code,major_name from dict_major_info where major_delete = 0";
        if (academy_code != null) sql += " where academy_code=" + academy_code;
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string jsonstr = ConventDataTableToJson.Serialize(dt);
        return jsonstr;
    }

    public string getClassList(string major_code=null,string academy_code=null)
    {
        string sql = "select class_idx,class_name from data_class where class_delete = 0 ";
        if (major_code != null) sql += " and major_code=" + major_code;
        if (academy_code != null) sql += " and major_code in (select major_code from dict_major_info where academy_code=" + academy_code+")";
        sql += " order by class_name";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string jsonstr = ConventDataTableToJson.Serialize(dt);
        return jsonstr;
    }

    public string getSubjectLsit()
    {
        string sql = "select subject_idx,subject_name from data_subject where subject_delete = 0";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string jsonstr = ConventDataTableToJson.Serialize(dt);
        return jsonstr;
    }

    public string getABClassList(string submitData)
    {
        string sql = "select class_idx,class_name,link_class_type from data_class where class_delete = 0 and link_class_type = 1 ";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string jsonstr = ConventDataTableToJson.Serialize(dt);
        return jsonstr;
    }

    public string getNoABClassList(string submitData)
    {
        string sql = "select class_idx,class_name from data_class where class_delete = 0 and link_class_type = 0 ";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string jsonstr = ConventDataTableToJson.Serialize(dt);
        return jsonstr;
    }
}