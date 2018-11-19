<%@ WebHandler Language="C#" Class="scoreManage" %>

using System;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Web.SessionState;

public class scoreManage : IHttpHandler,IReadOnlySessionState {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        string submitData = context.Request.Form["submitData"] == null ? "NULL" : context.Request.Form["submitData"];
        string option = submitData.Split(';')[0];
        string result = "";
        switch (option)
        {
            case "LOAD_INFO":
                result = loadInfo(submitData);
                break;
            case "UPDATE":
                result = updateInfo(submitData);
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

    public string loadInfo(string submitData)
    {
        string planIdx = submitData.Split(';')[1].Split(',')[0];
        string subjectIdx = submitData.Split(';')[1].Split(',')[1];
        Account account = (Account)HttpContext.Current.Session["account"];
        int accountIdx = account.account_idx;
        //string sql = @"select plan_file,class_name,subject_name,account_name from data_plan t1 
        //                left join data_subject t2 on t1.subject_idx = t2.subject_idx 
        //                left join data_class t3 on t2.class_idx = t3.class_idx
        //                left join view_account_name t4 on t4.account_idx =@accontidx
        //                where plan_idx=@idx";
        string sql = @"select A.*,B.*,C.*,D.*,E.*,F.*,G.*,H.* from 
                        (
                            select plan_file,class_name,subject_name,account_name,year_name from data_plan t1 
                            left join data_subject t2 on t1.subject_idx = t2.subject_idx 
                            left join data_class t3 on t2.class_idx = t3.class_idx
                            left join view_account_name t4 on t4.account_idx =@accontIdx
                            left join dbo.dict_year_info t5 on t2.year_code = t5.year_code
                            where plan_idx=@planIdx
                        )  A join                        
                        (
                            select count(1) as studentNum from data_study t1 
                            where t1.subject_idx = @subjectIdx 
                        ) B on 1=1  join
                        (
                            select count(1) as levelA from data_study t1 
                            left join dbo.data_student t2 on t1.student_idx=t2.student_idx
                            where t1.subject_idx =@subjectIdx and study_total_score>=90
                        ) C on 1=1 join 
                        (
                            select count(1) as levelB from data_study t1 
                            left join dbo.data_student t2 on t1.student_idx=t2.student_idx
                            where t1.subject_idx = @subjectIdx and study_total_score>=80 and study_total_score<90
                        ) D on 1=1 join
                        (
                            select count(1) as levelC from data_study t1 
                            left join dbo.data_student t2 on t1.student_idx=t2.student_idx
                            where t1.subject_idx = @subjectIdx and study_total_score>=70 and study_total_score<80
                        ) E on 1=1 join
                        (
                            select count(1) as levelD from data_study t1 
                            left join dbo.data_student t2 on t1.student_idx=t2.student_idx
                            where t1.subject_idx = @subjectIdx and study_total_score>=60 and study_total_score<70
                        ) F on 1=1 join
	                    (
                            select count(1) as levelE from data_study t1 
                            left join dbo.data_student t2 on t1.student_idx=t2.student_idx
                            where t1.subject_idx = @subjectIdx and study_total_score>=50 and study_total_score<60
                        ) G on 1=1 join
	                    (
                            select count(1) as levelF from data_study t1 
                            left join dbo.data_student t2 on t1.student_idx=t2.student_idx
                            where t1.subject_idx = @subjectIdx and study_total_score<50
                        ) H on 1=1";
        SqlParameter[] paras = {
            new SqlParameter("@planIdx", planIdx),
            new SqlParameter("@accontIdx", accountIdx),
            new SqlParameter("@subjectIdx", subjectIdx),
        };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        string result = "0";
        if (dt.Rows.Count == 1)
        {
            result = ConventDataTableToJson.Serialize(dt);
        }
        return result;
    }

    public string updateInfo(string submitData)
    {
        string planIdx = submitData.Split(';')[1];
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string data = submitData.Split(';')[2];
        string time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        // 1. 定义sql语句
        string sql = @"update data_plan set plan_file=@file,plan_update=getDate() where plan_idx=@idx";
        // 2. 定义传入的param数组        
        SqlParameter[] paras =
        {
            new SqlParameter("@file",data),
            new SqlParameter("@idx",planIdx)
        };
        // 3.将sql语句和param数组传入执行函数进行执行，根据执行结果返回提示信息或0。
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "更新成功！" : "0";
    }

}