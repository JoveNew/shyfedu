/*
作者：yangchen
最新修改日期：2018.8.27

文档说明：
根据网页请求的命令，对数据库进行增删改操作。利用SqlParameter实现C#防注入，安全性得到升级
*/
<%@ WebHandler Language="C#" Class="getStudentInfo_test" %>

using System;
using System.Data;
using System.Text;
using System.Web;
using System.Data.SqlClient;
using System.IO;


public class getStudentInfo_test : IHttpHandler
{
    private SQLConnection m_con = new SQLConnection();
    public void ProcessRequest(HttpContext context)
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
                result = deleteStudent(submitData);
                break;
            case "INSERT":
                result = insertInfo(submitData);
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
            sqlWhere += " and student_code like @code";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and student_name like @name";
        }
        if (searchParas[2] != "")
        {
            sqlWhere += " and student_sex = @sex";
        }
        if (searchParas[3] != "")
        {
            sqlWhere += " and academy_code = @academy";
        }
        if (searchParas[4] != "")
        {
            sqlWhere += " and major_code = @major";
        }
        if (searchParas[5] != "")
        {
            sqlWhere += " and (class_idx=@classIdx or link_class_idx = @classIdx)";
        }
        //定义参数数组
        SqlParameter[] paras =
            {
                new SqlParameter("@code","%"+searchParas[0]+"%"),
                new SqlParameter("@name","%"+searchParas[1]+"%"),
                new SqlParameter("@sex",searchParas[2]),
                new SqlParameter("@academy",searchParas[3]),
                new SqlParameter("@major",searchParas[4]),
                new SqlParameter("@classIdx",searchParas[5]),
            };
        string tableName = "view_student_info";
        string indexName = "student_idx";
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

    //对返回的内容进行包装，获得最终返回给前端的json格式数据
    string getFinalJson(int total, string jsonstr)
    {
        return "{\"total\":" + total + ",\"rows\":" + jsonstr + "}";
    }

    //加载单条数据
    public string loadInfo(string submitData)
    {
        string studentIdx = submitData.Split(';')[1];
        string sql = "select * from data_student where student_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", studentIdx), };
        DataTable dt = m_con.doSql(sql, paras);
        string result = "0";
        if (dt.Rows.Count == 1)
        {
            result = ConventDataTableToJson.Serialize(dt);
        }
        return result;
    }

    //删除
    public string deleteStudent(string submitData)
    {
        string studentIdx = submitData.Split(';')[1];
        string sql = @"update data_student set student_delete = 1 where student_idx = @idx";
        SqlParameter[] paras = { new SqlParameter("@idx", studentIdx), };
        string result = m_con.exSql(sql, paras).ToString() == "1" ? "删除成功！" : "0";
        return result;
    }

    //更新
    public string updateInfo(string submitData)
    {
        //更新命令格式：opt；idx；data；image    
        string studentIdx = submitData.Split(';')[1];
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[2].Split(',');
        string img_base64 = submitData.Split(';')[3];
        string img_name = data[8];            //获取原照片名称，若为发生更改，则以原名称保存
        if (img_base64 != "undefined" && img_base64 != "" && img_base64 != null)
        {
            img_name = saveImg(img_base64, data[0], data[8]);   //data[0]：学号，data[6]：原照片名称
        }
        // 1. 定义sql语句
        string sql = @"update data_student set student_code=@code,student_name=@name,student_sex=@sex,class_idx=@classIdx,link_class_idx=@linkClassIdx,major_code=@majorCode,academy_code=@academyCode,student_grade=@grade,student_update=getDate(),student_image=@img where student_idx = @idx";
        // 2. 定义传入的param数组
        SqlParameter[] paras =
        {
                new SqlParameter("@code",data[0]),
                new SqlParameter("@name",data[1]),
                new SqlParameter("@sex",data[2]),
                new SqlParameter("@grade",data[3]),
                new SqlParameter("@classIdx",data[4]=="null"?"0":data[4]),
                new SqlParameter("@linkClassIdx",data[5]=="null"?"0":data[5]),
                new SqlParameter("@majorCode",data[6]),
                new SqlParameter("@academyCode",data[7]),
                new SqlParameter("@img",img_name),
                new SqlParameter("@idx",studentIdx),
        };
        // 3.将sql语句和param数组传入执行函数进行执行，根据执行结果返回提示信息或0。
        string result = m_con.exSql(sql, paras).ToString() == "1" ? "更新成功！" : "0";
        return result;
    }

    //插入 
    public string insertInfo(string submitData)
    {
        //插入命令格式：opt;data;image
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[1].Split(',');
        string img_base64 = submitData.Split(';')[2];
        string img_name = data[8];            //获取原照片名称,此处传上来的值为空
        if (img_base64 != "undefined" && img_base64 != "" && img_base64 != null)
        {
            img_name = saveImg(img_base64, data[0], data[8]);   //data[0]：学号，data[6]：原照片名称
        }
        string time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

        string sql = @"Insert into data_student (student_code,student_name,student_sex,student_grade,class_idx,link_class_idx,major_code,academy_code,student_image) VALUES(@code,@name,@sex,@grade,@classIdx,@linkClassIdx,@majorCode,@academyCode,@image)";
        SqlParameter[] paras =
            {
                new SqlParameter("@code",data[0]),
                new SqlParameter("@name",data[1]),
                new SqlParameter("@sex",data[2]),
                new SqlParameter("@grade",data[3]),
                new SqlParameter("@classIdx",data[4]),
                new SqlParameter("@linkClassIdx",data[5]),
                new SqlParameter("@majorCode",data[6]),
                new SqlParameter("@academyCode",data[7]),
                new SqlParameter("@image",img_name),
            };
        string result = m_con.exSql(sql, paras).ToString() == "1" ? "新增成功！" : "0";
        return result;
    }

    //将传入的base64图片编码转为文件保存在服务器指定位置
    public string saveImg(string base64Str, string student_code, string originalImg)
    {
        string result = "";
        try
        {
            byte[] bt = Convert.FromBase64String(base64Str);   //获取图片base64,讲其转为byte数组
            //string fileName = DateTime.Now.Year.ToString() + DateTime.Now.Month.ToString();  //获取当前年月用于检查或创建文件夹
            string ImageFilePath = "/dataImage" + "/studentImage/";    //定义照片存储文件夹路径
            if (Directory.Exists(HttpContext.Current.Server.MapPath(ImageFilePath)) == false)  //如果不存在就创建文件夹
            {
                Directory.CreateDirectory(HttpContext.Current.Server.MapPath(ImageFilePath));
            }
            //string imageName = System.DateTime.Now.ToString("yyyyHHddHHmmss");    //定义照片名
            string imageName = "st"+"_"+student_code + "_" + System.DateTime.Now.ToString("yyyyHHddHHmmss");
            string imagePath = HttpContext.Current.Server.MapPath(ImageFilePath) + "/" + imageName;    //定义照片完整路径
            if (originalImg != "")  //如果原照片存在
            {
                string originalImgPath = HttpContext.Current.Server.MapPath(ImageFilePath) + "/" + originalImg;  //定义原照片完整路径
                if (System.IO.File.Exists(Path.GetFullPath(originalImgPath)))    //如果当前学生已经提交过照片，则删除原照片
                {
                    File.Delete(Path.GetFullPath(originalImgPath));
                }
            }
            File.WriteAllBytes(imagePath + ".jpg", bt);     //保存图片到服务器，然后获取路径  
            result = imageName + ".jpg";    //获取保存后的文件名
        }
        catch (Exception e)
        {
            throw e;
        }
        //LogHelper.WriteLog(ErrorPrompt.Success);
        return result;
    }
}   