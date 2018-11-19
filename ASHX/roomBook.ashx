<%@ WebHandler Language="C#" Class="roomBook" %>

using System;
using System.Web;
using System.Data;
using System.Text;
using System.Configuration;

public class roomBook : IHttpHandler {
    private SQLConnection m_con = new SQLConnection();
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        string roomCode = context.Request.Form["roomCode"].ToString();
        string bookDay = context.Request.Form["bookDay"].ToString();
        string bookTime = context.Request.Form["bookTime"].ToString();
        string bookTeacher = context.Request.Form["bookTeacher"].ToString();
        string bookReason = context.Request.Form["bookReason"].ToString();
        
        string sql = "";
        string nowTime = DateTime.Now.ToString();
        sql = "insert into data_room_book (room_idx,room_book_day,room_book_time,room_book_status,room_apply_reason,room_apply_time,room_book_delete,room_book_create,room_book_update)"
                        + "values(" + roomCode + ",'" + bookDay + "','" + bookTime + "','" + 0 + "','" + bookReason + "','" + nowTime + "'," + 0 + ",'" + nowTime + "','" + nowTime + "')";
        int result = m_con.exSql(sql);
        context.Response.Write(result.ToString());
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}