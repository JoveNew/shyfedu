<%@ WebHandler Language="C#" Class="getRoomBookInfoJson" %>

using System;
using System.Data;
using System.Text;
using System.Web;

public class getRoomBookInfoJson : IHttpHandler {
    private SQLConnection m_con = new SQLConnection();
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        string room_idx = context.Request.Form["room_idx"].ToString();
        DataTable dt = m_con.doSql("SELECT id,title,start,[end] FROM View_roomBookList where room_idx=" + room_idx);
        //DataTable dt = m_con.doSql("SELECT id,title,start,[end] FROM View_roomBookList ");
        string errcode = "";
        string errmsg = "";
        string result = "";
        if (dt.Rows.Count > 0)
        {
//            errcode = "0";
//            errmsg = "success";
            string jsonstr = ConventDataTableToJson.Serialize(dt);
            result = jsonstr;
//            jsonstr = jsonstr.Replace("[", "");
//            jsonstr = jsonstr.Replace("]", "");

//            StringBuilder sb = new StringBuilder("{");
//            sb.Append("\"ErrCode\":\"");//有数据为0，无数据、出错为1
//            sb.Append(errcode);
//            sb.Append("\",\"ErrMsg\":\"");
//            sb.Append(errmsg);
//            sb.Append("\",\"Response\":");
//            sb.Append("\"events\":");
//            sb.Append(jsonstr);
//            sb.Append("}");
//            result = sb.ToString();            
        }
        else
        {
            result = "[]";
        }
        context.Response.Write(result);
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}