<%@ WebHandler Language="C#" Class="planOfContentAndSchedule" %>

using System;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Web.SessionState;
using System.Web.Script.Serialization;
public class planOfContentAndSchedule : IHttpHandler,IReadOnlySessionState {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        string submitData = context.Request.Form["submitData"] == null ? "NULL" : context.Request.Form["submitData"];
        string option = submitData.Split(';')[0];
        string result = "";
        switch (option)
        {
            case "LOAD_ALL":
                result = loadInfo(submitData);
                break;
            case "LOAD_SELECT_ALL":
                result = loadSelectInfo(submitData);
                break;
            case "UPDATE":
                result = updateInfo(submitData);
                break;
            case "INSERT":
                result = insertInfo(submitData);
                break;
            case "DELETE":
                result = deleteInfo(submitData);
                break;
            case "MOVE":
                result = moveInfo(submitData);
                break;
            case "subject_type":
                result = subjectTypeList(submitData);
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
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        data_schedule data = serializer.Deserialize<data_schedule>(submitData.Split(';')[1]);
        string sql = @"select * from view_schedule_info where year_code=@year_code and 
                    (class_idx in
                        (
                            select class_idx from data_class where class_delete=0 and  
                                (class_idx=@class_idx or (link_class_idx=@class_idx and link_class_type='1') )
                            union
                            select link_class_idx from data_class where class_delete=0 and link_class_type='1' 
                                and class_idx=@class_idx
                        )
                    or teacher_idx=@teacher_idx or room_idx=@room_idx)";
        SqlParameter[] paras = {
                new SqlParameter("@year_code", data.year_code),
                new SqlParameter("@class_idx",  data.class_idx==null?"": data.class_idx),
                new SqlParameter("@teacher_idx", data.teacher_idx==null?"":data.teacher_idx),
                new SqlParameter("@room_idx", data.room_idx==null?"":data.room_idx),
            };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        string result = ConventDataTableToJson.Serialize(dt);
        return result;
    }

    public string loadSelectInfo(string submitData)
    {
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        data_schedule data = serializer.Deserialize<data_schedule>(submitData.Split(';')[1]);
        string sql = @"select * from view_schedule_info where year_code=@year_code and 
                    (class_idx in
                        (
                            select class_idx from data_class where class_delete=0 and  
                                (class_idx=(select class_idx from  view_schedule_info where schedule_idx=@schedule_idx) or (link_class_idx=@class_idx and link_class_type='1') )
                            union
                            select link_class_idx from data_class where class_delete=0 and link_class_type='1' 
                                and class_idx=(select class_idx from  view_schedule_info where schedule_idx=@schedule_idx)
                        )
                    or teacher_idx=(select teacher_idx from  view_schedule_info where schedule_idx=@schedule_idx) or room_idx=(select room_idx from  view_schedule_info where schedule_idx=@schedule_idx))
                    and schedule_idx not in 
                    (
                        select schedule_idx from view_schedule_info where year_code=@year_code and 
                        (class_idx in
                            (
                            select class_idx from data_class where class_delete=0 and  
                                (class_idx=@class_idx or (link_class_idx=@class_idx and link_class_type='1') )
                            union
                            select link_class_idx from data_class where class_delete=0 and link_class_type='1' 
                                and class_idx=@class_idx
                            )
                        or teacher_idx=@teacher_idx or room_idx=@room_idx)
                    )";
        SqlParameter[] paras = {
                new SqlParameter("@schedule_idx", data.schedule_idx),
                new SqlParameter("@year_code", data.year_code),
                new SqlParameter("@class_idx",  data.class_idx==null?"": data.class_idx),
                new SqlParameter("@teacher_idx", data.teacher_idx==null?"":data.teacher_idx),
                new SqlParameter("@room_idx", data.room_idx==null?"":data.room_idx),
            };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        string result = ConventDataTableToJson.Serialize(dt);
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


    public string insertInfo(string submitData)
    {
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        data_schedule data = serializer.Deserialize<data_schedule>(submitData.Split(';')[1]);
        Account account = (Account)HttpContext.Current.Session["account"];
        data.account_idx = account.account_idx.ToString();
        string countSql = @"select count(1) from view_schedule_info where 
                    year_code=@year_code and schedule_day=@schedule_day and schedule_sequence=@schedule_sequence and 
                    (class_idx=@class_idx or teacher_idx=@teacher_idx or room_idx=@room_idx)";
        string sql = @"Insert into data_schedule (year_code,class_idx,teacher_idx,room_idx,subject_type,
            schedule_day,schedule_sequence,account_idx) 
            VALUES(@year_code,@class_idx,@teacher_idx,@room_idx,@subject_type,
            @schedule_day,@schedule_sequence,@account_idx)";
        SqlParameter[] paras =
        {
                new SqlParameter("@year_code",data.year_code),
                new SqlParameter("@class_idx", data.class_idx),
                new SqlParameter("@teacher_idx",data.teacher_idx),
                new SqlParameter("@room_idx",data.room_idx),
                new SqlParameter("@subject_type",data.subject_type),
                new SqlParameter("@schedule_day",data.schedule_day),
                new SqlParameter("@schedule_sequence",data.schedule_sequence),
                new SqlParameter("@account_idx",data.account_idx),
        };
        int count = SQLServerDBHelp.exNumberSql(countSql,paras);
        if (count >= 1) return "0";
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? submitData.Split(';')[1] : "0";
    }
    public string deleteInfo(string submitData)
    {
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        data_schedule data = serializer.Deserialize<data_schedule>(submitData.Split(';')[1]);
        string sql = @"update data_schedule set schedule_delete=1,schedule_update=getdate() where 
                    schedule_idx=@schedule_idx";
        SqlParameter[] paras = {
                new SqlParameter("@schedule_idx", data.schedule_idx),
                
            };
        return SQLServerDBHelp.exSql(sql, paras) >= 1 ? submitData.Split(';')[1] : "0";
    }

    public string moveInfo(string submitData)
    {
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        data_schedule data = serializer.Deserialize<data_schedule>(submitData.Split(';')[1]);
        string sql = @"update data_schedule set schedule_day=@schedule_day,schedule_sequence=@schedule_sequence,schedule_update=getdate() where 
                    schedule_idx=@schedule_idx";
        SqlParameter[] paras = {
                new SqlParameter("@schedule_idx", data.schedule_idx),
                new SqlParameter("@schedule_day",data.schedule_day),
                new SqlParameter("@schedule_sequence",data.schedule_sequence),
            };
        return SQLServerDBHelp.exSql(sql, paras) >= 1 ? submitData.Split(';')[1] : "0";
    }

    //下拉框数据采集
    public string subjectTypeList(string submitData)
    {
        string classIdx = submitData.Split(';')[1];
        string yearCode = submitData.Split(';')[2];
        string year_n = yearCode.Substring(1, 4);//2018
        string year_t = yearCode.Substring(6, 1);//1
        string sql = @"select T.subject_type,T.subject_type_name,T.term,isnull(A.n,0) as num from 
                    (select t2.subject_type,t3.subject_type_name,
                CASE ("+year_n+"-convert(int,t2.train_grade))*2+"+year_t+@"
                        WHEN 1 THEN term1
                        WHEN 2 THEN term2
                        WHEN 3 THEN term3
                        WHEN 4 THEN term4
                        WHEN 5 THEN term5
                        WHEN 6 THEN term6
                END AS term 
                from data_class t1 join data_major_train t2 on t1.major_code=t2.major_code  and  t1.class_grade=t2.train_grade 
                inner join dict_subject_type t3 on t2.subject_type=t3.subject_type  where class_idx="+classIdx+@" and subject_type_delete=0
                ) T left join 
                (
                select subject_type, count(1) as n from data_schedule where year_code='"+yearCode+"' and class_idx="+classIdx+@" and schedule_delete=0 group by subject_type)
                A on T.subject_type=A.subject_type
                where T.term<>0 ";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string data = ConventDataTableToJson.Serialize(dt);
        return data;
    }

    public string teacherList()
    {
        string sql = "select teacher_idx,teacher_name from data_teacher where teacher_delete=0";
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
        string sql = "select year_code,year_name from dict_year_info where year_delete=0";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string data = ConventDataTableToJson.Serialize(dt);
        return data;
    }

    public string classList()
    {
        string sql = "select class_idx,class_name,link_class_type,link_class_idx from data_class where class_delete=0 order by class_name asc";
        DataTable dt = SQLServerDBHelp.doSql(sql);
        string data = ConventDataTableToJson.Serialize(dt);
        return data;
    }
}

public class data_schedule
{
    public string schedule_idx { get ; set; }
    public string year_code { get; set; }
    public string class_idx { get; set; }
    public string teacher_idx { get; set; }
    public string room_idx { get; set; }
    public string subject_type { get; set; }
    public string schedule_day { get; set; }
    public string schedule_sequence { get; set; }
    public string schedule_remark { get; set; }
    public string schedule_status { get; set; }
    public string account_idx { get; set; }
    public string schedule_delete { get; set; }
    public string schedule_create { get; set; }
    public string schedule_update { get; set; }
    public string class_name { get; set; }
    public string teacher_name { get; set; }
    public string subject_type_name { get; set; }
    public string room_name { get; set; }
    
}
