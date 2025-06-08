import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'file_market',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export type QueryResult<T = any> = T[];

export async function query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as QueryResult<T>;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
}

export async function transaction<T>(callback: (connection: mysql.Connection) => Promise<T>): Promise<T> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export default pool; 