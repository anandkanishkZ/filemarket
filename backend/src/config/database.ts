import mysql from 'mysql2/promise';
import { logger } from '../utils/logger';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nepal_tech_book',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
};

// Health check function
export const healthCheck = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return {
      status: 'ok',
      message: 'Database connection successful'
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'error',
      message: 'Database connection failed'
    };
  }
};

// Query function with error handling
export const query = async <T>(sql: string, params?: any[]): Promise<[T, any]> => {
  try {
    const results = await pool.execute(sql, params);
    return results as [T, any];
  } catch (error) {
    logger.error('Database query failed:', error);
    throw error;
  }
};

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

export type QueryResult<T = any> = T[];

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