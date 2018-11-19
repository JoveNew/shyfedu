<%@ WebHandler Language="C#" Class="majorTrain" %>

using System;
using System.Web;
using System.Data;
using System.Text;
using System.Data.SqlClient;
using System.IO;

public class majorTrain : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
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
            case "SubjectType":
                result = loadSubjectType();
                break;
            case "Major":
                result = loadMajor();
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
            sqlWhere += " and major_code=@code";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and major_code=@necode";
        }
        if (searchParas[2] != "null")
        {
            sqlWhere += " and train_grade=@grade";
        }
        //定义参数数组
        SqlParameter[] paras =
            {
                new SqlParameter("@code",searchParas[0]),
                new SqlParameter("@necode",searchParas[1]),
                new SqlParameter("@grade",searchParas[2]),
            };
        string tableName = "view_major_train_info";
        string indexNmae = "train_idx";
        //*****************************修改内容end******************************
        string countSql = @"select count(1) from "+tableName+" where 1=1 " + sqlWhere;
        string sql = @"select * from (select row_number()over(ORDER BY "+indexNmae+") AS rownumber ,* from " + tableName + " where 1=1 "
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
        string idx = submitData.Split(';')[1];
        string sql = "select * from view_major_train_info where train_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx) };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        if (dt.Rows.Count != 1) return "0";
        return ConventDataTableToJson.Serialize(dt);
    }


    //删除
    public string delete(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = @"update data_major_train set train_delete =1,train_update=getdate() where train_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx), };
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "删除成功！" : "0";
    }

    //更新
    public string update(string submitData)
    {
        string idx = submitData.Split(';')[1];
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[2].Split(',');
        string sql = @"update data_major_train set major_code=@code,train_grade=@grade,subject_type=@subject,term1=@term1,term2=@term2,
                       term3=@term3,term4=@term4,term5=@term5,term6=@term6,term_total=@termTotal,train_update=getdate() where train_idx=@idx";
        SqlParameter[] paras =
        {
            new SqlParameter("@code",data[1]),
            new SqlParameter("@grade",data[2]),
            new SqlParameter("@subject",data[3]),
            new SqlParameter("@term1",data[4]),
            new SqlParameter("@term2",data[5]),
            new SqlParameter("@term3",data[6]),
            new SqlParameter("@term4",data[7]),
            new SqlParameter("@term5",data[8]),
            new SqlParameter("@term6",data[9]),
            new SqlParameter("@termTotal",data[10]),
            new SqlParameter("@idx",idx)
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "更新成功！" : "0";
    }

    //插入
    public string insert(string submitData)
    {
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[1].Split(',');
        string sql = @"Insert into data_major_train (major_code,train_grade,subject_type,term1,term2,term3,term4,term5,term6,term_total) 
            VALUES(@code,@grade,@subject,@term1,@term2,@term3,@term4,@term5,@term6,@termTotal)";
        SqlParameter[] paras =
        {
            new SqlParameter("@code",data[1]),
            new SqlParameter("@grade",data[2]),
            new SqlParameter("@subject",data[3]),
            new SqlParameter("@term1",data[4]),
            new SqlParameter("@term2",data[5]),
            new SqlParameter("@term3",data[6]),
            new SqlParameter("@term4",data[7]),
            new SqlParameter("@term5",data[8]),
            new SqlParameter("@term6",data[9]),
            new SqlParameter("@termTotal",data[10]),
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "新增成功！" : "0";
    }

    public string loadSubjectType()
    {
        string sql = "select subject_type,subject_type_name from dict_subject_type where subject_type_delete=0";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        return ConventDataTableToJson.Serialize(dt);
    }
        
    public string loadMajor()
    {
        string sql = "select major_code,major_name from dict_major_info where major_delete=0";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        return ConventDataTableToJson.Serialize(dt);
    }
}