using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.OleDb;
using System.Data.SqlClient;
using System.Data;
using System.ComponentModel;
using System.Configuration;

    public static class SQLServerDBPool
    {
        /// <summary>
        /// 连接池可用最大值
        /// </summary>
        private static int PoolMaxSize = 100;
        /// <summary>
        /// 连接池保留最小值
        /// </summary>
        private static int PoolMinSize = 10;
        /// <summary>
        /// 当前连接池连接数
        /// </summary>
        private static int CurrPoolConNum = 0;
        /// <summary>
        /// 数据库连接串
        /// </summary>
        public static string ConnString = ConfigurationManager.ConnectionStrings["sqlConnectionString"].ToString();
        /// <summary>
        /// 数据库连接池栈
        /// </summary>
        private static Stack<SqlConnection> pool= new Stack<SqlConnection>();
        /// <summary>
        /// 数据库连接锁对象
        /// </summary>
        private static object lockObj = new object();
        /// <summary>
        /// Get一个数据库连接,使用完毕,务必调用Release
        /// </summary>
        /// <returns></returns>
        public static SqlConnection GetConnection()
        {
            lock (lockObj)
            {
                SqlConnection thisConn = null;
                if (pool.Count == 0)
                {
                    if (CurrPoolConNum >= PoolMaxSize) return null;
                    thisConn = new SqlConnection(ConnString);
                    CurrPoolConNum++;
                }
                else
                    thisConn = pool.Pop();
                thisConn.Open();
                return thisConn;
            }
        }
        /// <summary>
        /// Release一个数据库连接，返回栈中，或释放
        /// </summary>
        /// <param name="conn"></param>
        public static void ReleaseConnection(SqlConnection conn)
        {
            lock (lockObj)
            {
                conn.Close();
                if (pool.Count >= PoolMinSize)
                {
                    conn.Dispose();
                    CurrPoolConNum--;
                }
                else
                {
                    pool.Push(conn);
                }
            }
        }
        /// <summary>
        /// 获取当前数据库连接数
        /// </summary>
        /// <returns></returns>
        public static int GetCurrPoolConnNum()
        {
            lock (lockObj)
            {
                return CurrPoolConNum;
            }
        }

    }


    public static class SQLServerDBHelp
    {
        /// <summary>
        /// 错误格式化
        /// </summary>
        /// <param name="ex"></param>
        /// <param name="sqlcmd"></param>
        /// <returns></returns>
        private static string ExFormat(string ex, string sqlcmd)
        {
            return "[SQL:" + ex + "ERROR:" + sqlcmd + "]";
        }
        /// <summary>
        /// 测试数据库连接
        /// </summary>
        public static void testDbConnection()
        { 
            SqlConnection conn = SQLServerDBPool.GetConnection();
            SQLServerDBPool.ReleaseConnection(conn);
        }
        /// <summary>
        /// 查询SQL,返回DataTable结果集,出错返回NULL
        /// </summary>
        /// <param name="sql"></param>
        /// <returns></returns>
        public static DataTable doSql(String sql, SqlParameter[] paras = null)
        {
            DataTable resultSet = null;
            SqlConnection conn = SQLServerDBPool.GetConnection();
            try
            {
                SqlDataAdapter adapter = new SqlDataAdapter(sql, conn);
                if (paras != null)
                {
                    foreach (SqlParameter p in paras)
                    {
                        adapter.SelectCommand.Parameters.Add(p);
                    }
                }
                DataSet ds = new DataSet();
                adapter.Fill(ds);
                resultSet = ds.Tables[0];
                adapter.SelectCommand.Parameters.Clear();
            }
            catch (Exception ex)
            {
                throw new Exception(ExFormat(ex.Message, sql));
            }
            finally
            {
                SQLServerDBPool.ReleaseConnection(conn);
            }
            return resultSet;
        }
        /// <summary>
        /// 查询到ListItem
        /// </summary>
        /// <param name="sql"></param>
        /// <returns></returns>
        public static List<KeyValuePair<string, string>> doSqlToListItem(string sql, SqlParameter[] paras = null)
        {

            List<KeyValuePair<string, string>> items = new List<KeyValuePair<string, string>>();
            SqlConnection conn = SQLServerDBPool.GetConnection();
            try
            {
                SqlCommand comm = new SqlCommand(sql, conn);
                if (paras != null)
                {
                    foreach (SqlParameter p in paras)
                    {
                        comm.Parameters.Add(p);
                    }
                }
                SqlDataReader rdr = comm.ExecuteReader();
                while (rdr.Read())
                {
                    items.Add(new KeyValuePair<string, string>(rdr[0].ToString(), rdr[1].ToString()));
                }
                comm.Parameters.Clear();
            }
            catch (Exception ex)
            {
                throw new Exception(ExFormat(ex.Message, sql));
            }
            finally
            {
                SQLServerDBPool.ReleaseConnection(conn);
            }
            return items;
        }
        /// <summary>
        /// 查询数据到对象组
        /// </summary>
        /// <param name="sql"></param>
        /// <param name="data"></param>
        /// <param name="type"></param>
        /// <returns></returns>
        public static List<T> doSqlToObject<T>(string sql, SqlParameter[] paras = null)
        {
            List<T> data = new List<T>();
            SqlConnection conn = SQLServerDBPool.GetConnection();
            try
            {
                SqlCommand comm = new SqlCommand(sql, conn);
                if (paras != null)
                {
                    foreach (SqlParameter p in paras)
                    {
                        comm.Parameters.Add(p);
                    }
                }
                SqlDataReader rdr = comm.ExecuteReader();
                data.Clear();
                PropertyDescriptorCollection properties = TypeDescriptor.GetProperties(typeof(T));
                int count = 0;
                while (rdr.Read())
                {
                    object t = System.Activator.CreateInstance(typeof(T));
                    foreach (PropertyDescriptor d in properties)
                    {
                        for(count=0;count<rdr.FieldCount; count++)
                        {
                            if (d.Name == rdr.GetName(count)&& !DBNull.Value.Equals(rdr[count]))
                            {
                                if (d.PropertyType == typeof(string))
                                    d.SetValue(t, rdr[count].ToString());
                                else if (d.PropertyType == typeof(int))
                                    d.SetValue(t, rdr.GetInt32(count));
                                else if (d.PropertyType == typeof(double))
                                    d.SetValue(t, rdr.GetDouble(count));
                                else if (d.PropertyType == typeof(decimal))
                                    d.SetValue(t, rdr.GetDecimal(count));
                                else if (d.PropertyType == typeof(Int64))
                                    d.SetValue(t, rdr.GetInt64(count));
                            }
                        }
                    }
                    data.Add((T)t);
                }
                comm.Parameters.Clear();
            }
            catch (Exception ex)
            {
                throw new Exception(ExFormat(ex.Message, sql));
            }
            finally
            {
                SQLServerDBPool.ReleaseConnection(conn);
            }
            return data;
        }
        /// <summary>
        /// 执行SQL,返回执行结果,参数化传值
        /// </summary>
        /// <param name="sql"></param>
        /// <param name="paras"></param>
        /// <returns></returns>
        public static int exSql(string sql, SqlParameter[] paras = null)
        {
            int result = 0;
            SqlConnection conn = SQLServerDBPool.GetConnection();
            try
            {
                SqlCommand comm = new SqlCommand(sql, conn);
                if (paras != null)
                {
                    foreach (SqlParameter p in paras)
                    {
                        comm.Parameters.Add(p);
                    }
                }
                result = comm.ExecuteNonQuery();
                comm.Parameters.Clear();

            }
            catch (Exception ex)
            {
                throw new Exception(ExFormat(ex.Message, sql));
            }
            finally
            {
                SQLServerDBPool.ReleaseConnection(conn);
            }
            return result;
        }
        /// <summary>
        /// 事务执行SQL集
        /// </summary>
        /// <param name="sqls"></param>
        public static void exSql(List<string> sqls)
        {
            string ErrorSql = String.Empty;
            SqlConnection conn = SQLServerDBPool.GetConnection();
            try
            {
                SqlTransaction trans = conn.BeginTransaction();
                try
                {
                    SqlCommand comm = conn.CreateCommand();
                    foreach (string sql in sqls)
                    {
                        comm.Transaction = trans;
                        comm.CommandText = sql;
                        comm.ExecuteNonQuery();
                    }
                    trans.Commit();
                }
                catch (Exception ex)
                {
                    trans.Rollback();
                    throw new Exception(ExFormat(ex.Message, ErrorSql));
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                SQLServerDBPool.ReleaseConnection(conn);
            }
        }
        /// <summary>
        /// 事务执行SQL集,参数化传值
        /// </summary>
        /// <param name="sqls"></param>
        public static void exSql(List<ExSQLSet> exSQLSets)
        {
            string ErrorSql = String.Empty;
            SqlConnection conn = SQLServerDBPool.GetConnection();
            try
            {
                SqlTransaction trans = conn.BeginTransaction();
                try
                {
                    SqlCommand comm = conn.CreateCommand();
                    foreach (ExSQLSet exSQLSet in exSQLSets)
                    {
                        comm.Transaction = trans;
                        comm.CommandText = exSQLSet.sql;
                        if (exSQLSet.paras != null)
                        {
                            foreach (SqlParameter p in exSQLSet.paras)
                            {
                                comm.Parameters.Add(p);
                            }
                        }
                        comm.ExecuteNonQuery();
                        comm.Parameters.Clear();
                    }
                    trans.Commit();
                }
                catch (Exception ex)
                {
                    trans.Rollback();
                    throw new Exception(ExFormat(ex.Message, ErrorSql));
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                SQLServerDBPool.ReleaseConnection(conn);
            }
        }
        /// <summary>
        /// 执行存储过程,参数化传值
        /// </summary>
        /// <param name="sqlPro"></param>
        /// <param name="Parameters"></param>
        /// <returns></returns>
        public static SqlParameter[] exProcess(String sqlPro, SqlParameter[] paras = null)
        {
            SqlParameter[] result = null;
            SqlConnection conn = SQLServerDBPool.GetConnection();
            try
            {
                SqlCommand comm = new SqlCommand(sqlPro, conn);
                comm.CommandType = CommandType.StoredProcedure;
                if (paras != null)
                {
                    foreach (SqlParameter p in paras)
                    {
                        comm.Parameters.Add(p);
                    }
                }
                comm.ExecuteNonQuery();
                result = new SqlParameter[comm.Parameters.Count];
                comm.Parameters.CopyTo(result, 0);
                comm.Parameters.Clear();
            }
            catch (Exception ex)
            {
                throw new Exception(ExFormat(ex.Message, sqlPro));
            }
            finally
            {
                SQLServerDBPool.ReleaseConnection(conn);
            }
            return result;
        }
        /// <summary>
        /// 执行存储过程
        /// </summary>
        /// <param name="sqlPro"></param>
        /// <returns></returns>
        public static void exProcess(String sqlPro)
        {
            exProcess(sqlPro, null);
        }
        /// <summary>
        /// 返回数据库第一列第一行，SELECT COUNT(1)...
        /// </summary>
        /// <param name="sql"></param>
        /// <returns></returns>
        public static int exNumberSql(string sql, SqlParameter[] paras = null)
        {
            int anumber = 0;
            SqlConnection conn = SQLServerDBPool.GetConnection();
            try
            {
                SqlCommand comm = new SqlCommand(sql, conn);
                if (paras != null)
                {
                    foreach (SqlParameter p in paras)
                    {
                        comm.Parameters.Add(p);
                    }
                }
                anumber = (int)comm.ExecuteScalar();
                comm.Parameters.Clear();
            }
            catch (Exception ex)
            {
                throw new Exception(ExFormat(ex.Message, sql));
            }
            finally
            {
                SQLServerDBPool.ReleaseConnection(conn);
            }
            return anumber;
        } 
    }
    public struct ExSQLSet
    {
        public string sql { get; set; }
        public SqlParameter[] paras { get; set; }
    }
    
