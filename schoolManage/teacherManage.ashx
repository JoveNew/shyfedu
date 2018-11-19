/*
作者：lixiaowen 
创建日期：2018.8.10
文档说明：

根据网页请求的命令，从数据库获取设备信息数据。

转换成JSON格式，返回给网页处理。

作者：lixiaowen
创建日期：2018.8.10
文档说明：
增加误删撤销功能。

作者：lixiaowen
创建日期：2018.8.29
文档说明：
修改数据输入方式，翻页方式。

作者：lixiaowen
创建日期：2018.8.30
文档说明：
修改搜索功能判断条件

作者：lixiaowen
创建日期：2018.9.6
文档说明：
增加照片上传功能

*/

<%@ WebHandler Language="C#" Class="teacherManage" %>

using System;
using System.Web;
using System.Data;
using System.Text;
using System.Data.SqlClient;
using System.IO;

public class teacherManage : IHttpHandler
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
            sqlWhere += " and teacher_code like @code";
        }
        if (searchParas[1] != "")
        {
            sqlWhere += " and teacher_name like @name";
        }
        if (searchParas[2] != "")
        {
            sqlWhere += " and teacher_sex=@sex";
        }
        if (searchParas[3] != "")
        {
            sqlWhere += " and academy_code=@academy";
        }
        //if (searchParas[4] != "null")
        //{
        //    sqlWhere += " and major_code=@major";
        //}
        //定义参数数组
        SqlParameter[] paras =
            {
                new SqlParameter("@code","%"+searchParas[0]+"%"),
                new SqlParameter("@name","%"+searchParas[1]+"%"),
                new SqlParameter("@sex",searchParas[2]),
                new SqlParameter("@academy",searchParas[3]),
                //new SqlParameter("@major",searchParas[4]),
            };
        string tableName = "view_teacher_info";
        string indexName = "teacher_idx";
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
        string sql = "select * from view_teacher_info where teacher_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx) };
        DataTable dt = SQLServerDBHelp.doSql(sql, paras);
        if (dt.Rows.Count != 1) return "0";
        return ConventDataTableToJson.Serialize(dt);
    }

    //删除
    public string delete(string submitData)
    {
        string idx = submitData.Split(';')[1];
        string sql = @"update data_teacher set teacher_delete =1 where teacher_idx=@idx";
        SqlParameter[] paras = { new SqlParameter("@idx", idx), };
        return SQLServerDBHelp.exSql(sql, paras) == 1 ? "删除成功！" : "0";
    }

    //更新
    public string update(string submitData)
    {
        string idx = submitData.Split(';')[1];
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[2].Split(',');

        string img_base64 = submitData.Split(';')[3];
        string img_name = data[5]; //获取原照片名称，若未发生更改，则以原名称保存
        if (img_base64 != "undefined" && img_base64 != "" && img_base64 != null)
        {
            img_name = saveImg(img_base64, data[0], data[5]);  //data[0]:工号 data[5]:原照片名称
        }
        string sql = @"update data_teacher set teacher_code=@code,teacher_name=@name,teacher_sex=@sex,
            major_code=@major,academy_code=@academy,teacher_update=getdate(),teacher_image=@img where teacher_idx=@idx";
        SqlParameter[] paras =
        {
            new SqlParameter("@code",data[0]),
            new SqlParameter("@name",data[1]),
            new SqlParameter("@sex",data[2]),
            new SqlParameter("@major",data[3]),
            new SqlParameter("@academy",data[4]),
            new SqlParameter("@img",img_name),
            new SqlParameter("@idx",idx)
        };
        return SQLServerDBHelp.exSql(sql, paras).ToString() == "1" ? "更新成功！" : "0";
    }

    //插入
    public string insert(string submitData)
    {
        //获取传入的数据，字段的顺序与页面的input顺序一致，字段之间用","分隔
        string[] data = submitData.Split(';')[1].Split(',');
        string img_base64 = submitData.Split(';')[2];
        string img_name = data[4];            //获取原照片名称,此处传上来的值为空
        if (img_base64 != "undefined" && img_base64 != "" && img_base64 != null)
        {
            img_name = saveImg(img_base64, data[0], data[4]);   //data[0]：学号，data[4]：原照片名称
        }
        string sql = @"Insert into data_teacher (teacher_code,teacher_name,teacher_sex,major_code,academy_code,teacher_image) 
            VALUES(@code,@name,@sex,@major,@academy,@img)";
        SqlParameter[] paras =
        {
            new SqlParameter("@code",data[0]),
            new SqlParameter("@name",data[1]),
            new SqlParameter("@sex",data[2]),
            new SqlParameter("@major",data[3]),
            new SqlParameter("@academy",data[4]),
            new SqlParameter("@img",img_name)
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

    //将传入的base64图片编码转为文件保存在服务器指定位置
    public string saveImg(string base64Str, string teacher_code, string originalImg)
    {
        string result = "";
        try
        {
            byte[] bt = Convert.FromBase64String(base64Str);   //获取图片base64,讲其转为byte数组
            //string fileName = DateTime.Now.Year.ToString() + DateTime.Now.Month.ToString();  //获取当前年月用于检查或创建文件夹
            string ImageFilePath = "../dataImage" + "/teacherImage";    //定义照片存储文件夹路径
            if (Directory.Exists(HttpContext.Current.Server.MapPath(ImageFilePath)) == false)  //如果不存在就创建文件夹
            {
                Directory.CreateDirectory(HttpContext.Current.Server.MapPath(ImageFilePath));
            }
            //string imageName = System.DateTime.Now.ToString("yyyyHHddHHmmss");    //定义照片名
            string imageName = "tch" + "_" + teacher_code + "_" + System.DateTime.Now.ToString("yyyyHHddHHmmss");
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