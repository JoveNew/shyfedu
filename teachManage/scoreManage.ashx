<%@ WebHandler Language="C#" Class="scoreManage" %>

using System;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Web.SessionState;

public class scoreManage : IHttpHandler,IReadOnlySessionState
{

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
        Account account = (Account)HttpContext.Current.Session["account"];
        if(account.role_type == "S" && searchParas[0] != "")
        {
            sqlWhere = "and subject_idx=@subject and student_idx=" + account.account_link_idx;
        }
        else if(searchParas[0] != "")
            sqlWhere = " and subject_idx=@subject";
        //定义参数数组
        SqlParameter[] paras =
            {
                new SqlParameter("@subject",searchParas[0]),
            };
        if (searchParas[1] == "0")
            sqlWhere += " and study_total_score>=60";
        else if (searchParas[1] == "1")
            sqlWhere += " and study_total_score<60";
        else 
            sqlWhere += "";
        string tableName = "view_study_info";
        string indexName = "study_idx";
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
        string idx = submitData.Split(';')[1];
        string sql = "select @idx as study_idx,study_common_score,study_middle_score,study_terminal_score,study_term_score,study_total_score from view_study_info where study_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx) };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        if (dt.Rows.Count != 1) return "0";
        return ConventDataTableToJson.Serialize(dt);
    }

    public string update(string submitData)
    {
        string idx = submitData.Split(';')[1];
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[2].Split(',');
        string sql = @"update data_study set study_score_teacher_idx=@scoreTeacher,study_common_score=@commonScoce,study_middle_score=@middleScore,
                    study_terminal_score=@terminalScore,study_term_score=@termScore,study_total_score=@totalScore,study_update=getdate() 
                    where study_idx=@idx";
        SqlParameter[] paras =
        {
            new SqlParameter("@scoreTeacher",data[0]),
            new SqlParameter("@commonScoce",data[1]),
            new SqlParameter("@middleScore",data[2]),
            new SqlParameter("@terminalScore",data[3]),
            new SqlParameter("@termScore",data[4]),
            new SqlParameter("@totalScore",data[5]),
            new SqlParameter("@idx",idx)
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "更新成功！" : "0";
    }
}