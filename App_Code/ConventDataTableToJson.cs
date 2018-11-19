using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;

/// <summary>
///  实现将从sql中取出的数据序列化，返回json格式数据
/// </summary>
public class ConventDataTableToJson
{
//	public ConventDataTableToJson()
//	{
//		//
//		//TODO: 在此处添加构造函数逻辑
//		//
//	}
    
    public static string Serialize(DataTable dt)
    {
        JavaScriptSerializer serializer = new JavaScriptSerializer();

        List<Dictionary<string, object>> list = new List<Dictionary<string, object>>();

        foreach (DataRow dr in dt.Rows)
        {
            Dictionary<string, object> result = new Dictionary<string, object>();

            foreach (DataColumn dc in dt.Columns)
            {
                result.Add(dc.ColumnName, dr[dc].ToString());
            }
            list.Add(result);
        }
        return serializer.Serialize(list);
    }
}