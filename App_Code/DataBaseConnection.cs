/****************************************
 * 文件说明 V1.0 zhangyu
 * 
 * 1.数据库连接类说明：


 * 1)本文件包含数据库连接、执行SQL语句、并返回数据集的功能。


 * 2)对应数据库包括：SQL Server、Access。


 * 
 * 2.如何在项目中加入DataBaseConnection.cs：


 * 1)如果没有App_Code目录，请右键点击项目->添加ASP.NET文件夹->App_Code
 * 2)将DataBaseConnection.cs加入App_Code
 * 
 * 3.在web.config中的数据库连接设置


 * 在web.config中的<configuration><connectionStrings>段，添加以下代码：


 * <add name="sqlConnectionString" connectionString="Data Source=(local);Database=ABC;User id=sa;PWD=1234"/>
 * 并根据实际情况修改connectionString属性的配置。


 * **************************************/

using System;
using System.Data;
using System.Configuration;
using System.Data.OleDb;
using System.Data.SqlClient;

//namespace DataBaseConnection

/// <summary>
/// SQL数据库相关操作


/// </summary>
public class SQLConnection
{
    public SqlConnection conn;

    public SQLConnection()
    {
        // 创建SQL数据库连接


        String connString = ConfigurationManager.ConnectionStrings["sqlConnectionString"].ToString();
        conn = new SqlConnection(connString);
    }

    public DataTable doSql(String sql)
    {
        // 打开数据库
        if(conn.State==System.Data.ConnectionState.Closed)
		{
			conn.Open();
		}
        // 创建数据集
        DataSet ds = new DataSet();     
        // 执行SQL语句
        SqlDataAdapter adapter = new SqlDataAdapter(sql, conn);
        adapter.Fill(ds);
        // 获取返回结果
        DataTable dt = ds.Tables[0];
        // 关闭数据库
        conn.Close();
        return dt;
    }

    //重载doSql函数实现参数化注入
    public DataTable doSql(String sql, SqlParameter[] paras)
    {
        // 打开数据库
        if (conn.State == System.Data.ConnectionState.Closed)
        {
            conn.Open();
        }
        // 创建数据集
        DataSet ds = new DataSet();
        // 执行SQL语句
        SqlDataAdapter adapter = new SqlDataAdapter(sql, conn);
        //循环paras数组进行注入
        foreach (SqlParameter p in paras)
        {
            adapter.SelectCommand.Parameters.AddWithValue(p.ParameterName, p.Value);
        }
        adapter.Fill(ds);
        // 获取返回结果
        DataTable dt = ds.Tables[0];
        adapter.SelectCommand.Parameters.Clear();
        // 关闭数据库
        conn.Close();
        return dt;
    }

    public int exSql(String sql)
    {
        int ret = 0;
        if (conn.State == System.Data.ConnectionState.Closed)
        {
            conn.Open();
        }
        SqlTransaction tran = conn.BeginTransaction();
        SqlCommand cmd = new SqlCommand(sql, conn, tran);
        ret = cmd.ExecuteNonQuery();
        tran.Commit();
        conn.Close();
        return ret;
    }

    //对exSql进行重载，实现C#参数化注入
    public int exSql(string sql, SqlParameter[] paras)
    {
        int ret = 0;
        if (conn.State == System.Data.ConnectionState.Closed)
        {
            conn.Open();
        }
        SqlTransaction tran = conn.BeginTransaction();
        SqlCommand cmd = new SqlCommand(sql, conn, tran);
        foreach (SqlParameter p in paras)
        {
            cmd.Parameters.AddWithValue(p.ParameterName, p.Value);
        }
        ret = cmd.ExecuteNonQuery();
        tran.Commit();
        cmd.Parameters.Clear();
        conn.Close();
        return ret;
    }

    private void writeLog(string type, string log)
    {
        if (conn.State == System.Data.ConnectionState.Closed)
        {
            conn.Open();
        }
        string nowTime = DateTime.Now.ToString();
        log = log.Replace("'", "''");
        string sql = "insert into log_manage(log_type,log_content,log_delete,log_create,log_update) values('" + type + "','" + log + "',0,'" + nowTime + "','" + nowTime + "')";
        SqlTransaction tran = conn.BeginTransaction();
        SqlCommand cmd = new SqlCommand(sql, conn, tran);
        cmd.ExecuteNonQuery();
        tran.Commit();
        conn.Close();
    }

	public void writeWSLog(string type,string log)
	{
		writeLog(type,log);
	}
}


/// <summary>
/// Access数据库相关操作


/// </summary>
public class AccessConnection
{
    OleDbConnection conn;

    public AccessConnection()
    {
        // 创建Access数据库连接


        String connString = ConfigurationManager.ConnectionStrings["accessConnectionString"].ToString();
        conn = new OleDbConnection(connString);
    }

    public DataTable doSql(String sql)
    {
        // 打开数据库


        conn.Open();
        // 创建数据集


        DataSet ds = new DataSet();
        // 执行SQL语句
        OleDbDataAdapter adapter = new OleDbDataAdapter(sql, conn);
        adapter.Fill(ds, "objDataSet");
        // 获取返回结果
        DataTable dt = ds.Tables[0];
        // 关闭数据库


        conn.Close();

        return dt;
    }

    public bool exSql(String sql)
    {
        bool ret = false;
        conn.Open();
        OleDbTransaction tran = conn.BeginTransaction();
        OleDbCommand cmd = new OleDbCommand(sql, conn, tran);
        try
        {
            cmd.ExecuteNonQuery();
            tran.Commit();
            ret = true;
        }
        catch
        {
            tran.Rollback();
            ret = false;
        }
        finally
        {
            conn.Close();
        }
        return ret;
    }
}


/****************************************
 * 历史修改记录
 * 
 * 2016.1.21 zhangyu
 * 增加开头的文件说明等注释。


 * 
 * 
 * 
 * **************************************/