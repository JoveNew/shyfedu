using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;


/// <summary>
///SaveFile 的摘要说明
/// </summary>
public static class SaveFile
{
    const string TEACHER_IMG_PATH=@"";
    const string STUDENT_IMG_PATH = @"";
    const string PROJECT_PATH = @"";
    const string PERFERT_PROJECT_PATH = @"";
    const string COURSEWARE_PATH = @"";
    const string HOMEWORK_PATH = @"";

    public static string saveTeacherImg(string base64Str, string teacherIdx, string originalImg)
    {

        string result = "";
        //try
        //{
        //    byte[] bt = Convert.FromBase64String(base64Str);   //获取图片base64,讲其转为byte数组
        //    //string fileName = DateTime.Now.Year.ToString() + DateTime.Now.Month.ToString();  //获取当前年月用于检查或创建文件夹
        //    string ImageFilePath = "../dataImage" + "/teacherImage";    //定义照片存储文件夹路径
        //    if (Directory.Exists(HttpContext.Current.Server.MapPath(ImageFilePath)) == false)  //如果不存在就创建文件夹
        //    {
        //        Directory.CreateDirectory(HttpContext.Current.Server.MapPath(ImageFilePath));
        //    }
        //    //string imageName = System.DateTime.Now.ToString("yyyyHHddHHmmss");    //定义照片名
        //    string imageName = "tch" + "_" + teacher_code + "_" + System.DateTime.Now.ToString("yyyyHHddHHmmss");
        //    string imagePath = HttpContext.Current.Server.MapPath(ImageFilePath) + "/" + imageName;    //定义照片完整路径
        //    if (originalImg != "")  //如果原照片存在
        //    {
        //        string originalImgPath = HttpContext.Current.Server.MapPath(ImageFilePath) + "/" + originalImg;  //定义原照片完整路径
        //        if (System.IO.File.Exists(Path.GetFullPath(originalImgPath)))    //如果当前学生已经提交过照片，则删除原照片
        //        {
        //            File.Delete(Path.GetFullPath(originalImgPath));
        //        }
        //    }
        //    File.WriteAllBytes(imagePath + ".jpg", bt);     //保存图片到服务器，然后获取路径  
        //    result = imageName + ".jpg";    //获取保存后的文件名
        //}
        //catch (Exception e)
        //{
        //    throw e;
        //}
        ////LogHelper.WriteLog(ErrorPrompt.Success);
        //return result;
        return "";
    }

    public static string saveStudentImg(string base64Str, string teacherIdx, string originalImg)
    {
        return "";
    }


    public static string saveHomework(string base64Str, string teacherIdx, string originalImg)
    {
        return "";
    }
}