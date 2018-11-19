<%@ WebHandler Language="C#" Class="lessonManage" %>

using System;
using System.Web;
using System.Data;
using System.Text;
using System.Data.SqlClient;

public class lessonManage : IHttpHandler {
    
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
            case "subject_idx":
                result = getSubjectList();
                break;
            case "teacher_idx":
                result = getTeacher();
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
            sqlWhere += " and  lesson_name like @lesson";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and teacher_name like @teacher";
        }
        if (searchParas[2] != "")
        {
            sqlWhere += " and subject_idx=@subject";
        }
        //定义参数数组
        SqlParameter[] paras =
            {
                new SqlParameter("@lesson","%"+searchParas[0]+"%"),
                new SqlParameter("@teacher","%"+searchParas[1]+"%"),
                new SqlParameter("@subject",searchParas[2]),
            };
        string tableName = "view_lesson_info";
        string indexName = "lesson_idx";
        //*****************************修改内容end******************************
        string countSql = @"select count(1) from " + tableName + " where 1=1 " + sqlWhere;
        string sql = @"select * from (select row_number()over(ORDER BY " + indexName + ") AS rownumber ,* from " + tableName + " where 1=1"
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

    string getFinalJson(int total, string jsonstr)
    {
        return "{\"total\":" + total + ",\"rows\":" + jsonstr + "}";
    }

    public string loadInfo(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = "select * from view_lesson_info where lesson_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx) };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        if (dt.Rows.Count != 1) return "0";
        return ConventDataTableToJson.Serialize(dt);
    }

    public string delete(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = @"update data_lesson set lesson_delete =1 where  lesson_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx), };
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "删除成功！" : "0";
    }

    public string update(string submitData)
    {
        string idx = submitData.Split(';')[1];
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[2].Split(',');
        string sql = @"update data_lesson set lesson_name=@lesson,subject_idx=@subject,teacher_idx=@teacher,lesson_sequence=@sequence,lesson_update=getDate() where lesson_idx=@idx";
        SqlParameter[] paras =
        {
            new SqlParameter("@lesson",data[0]),
            new SqlParameter("@subject",data[1]),
            new SqlParameter("@teacher",data[2]),
            new SqlParameter("@sequence",data[3]),
            new SqlParameter("@idx",idx)
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "更新成功！" : "0";
    }

    public string insert(string submitData)
    {
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[1].Split(',');
        string sql = @"Insert into data_lesson (lesson_name,subject_idx,teacher_idx,lesson_sequence) 
                       VALUES(@lesson,@subject,@teacher,@sequence)";
        SqlParameter[] paras =
        {
            new SqlParameter("@lesson",data[0]),
            new SqlParameter("@subject",data[1]),
            new SqlParameter("@teacher",data[2]),
            new SqlParameter("@sequence",data[3]),
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "新增成功！" : "0";
    }

    public string getSubjectList()
    {
        string sql = "select subject_idx,subject_name from data_subject";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        return ConventDataTableToJson.Serialize(dt);
    }

    public string getTeacher()
    {
        string sql = "select teacher_idx,teacher_name from data_teacher";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        return ConventDataTableToJson.Serialize(dt);
    }
}