import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get dashboard analytics
export const getDashboardAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get total files count
    const [filesCount] = await query('SELECT COUNT(*) as count FROM files');
    
    // Get total users count
    const [usersCount] = await query('SELECT COUNT(*) as count FROM users');
    
    // Get total purchases count and revenue
    const [purchasesData] = await query(`
      SELECT 
        COUNT(*) as total_purchases,
        SUM(amount) as total_revenue,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_purchases,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_purchases
      FROM purchases
    `);
    
    // Get monthly revenue for the last 12 months
    const monthlyRevenue = await query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(amount) as revenue,
        COUNT(*) as purchases
      FROM purchases 
      WHERE status = 'completed' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);
    
    // Get top selling files
    const topFiles = await query(`
      SELECT 
        f.id,
        f.title,
        f.price,
        COUNT(p.id) as purchase_count,
        SUM(p.amount) as total_revenue
      FROM files f
      LEFT JOIN purchases p ON f.id = p.file_id AND p.status = 'completed'
      GROUP BY f.id, f.title, f.price
      ORDER BY purchase_count DESC
      LIMIT 10
    `);
    
    // Get recent activity
    const recentActivity = await query(`
      SELECT 
        'purchase' as type,
        p.id,
        p.created_at,
        u.name as user_name,
        f.title as file_title,
        p.amount
      FROM purchases p
      JOIN users u ON p.user_id = u.id
      JOIN files f ON p.file_id = f.id
      ORDER BY p.created_at DESC
      LIMIT 20
    `);

    const analytics = {
      overview: {
        totalFiles: filesCount[0]?.count || 0,
        totalUsers: usersCount[0]?.count || 0,
        totalPurchases: purchasesData[0]?.total_purchases || 0,
        totalRevenue: purchasesData[0]?.total_revenue || 0,
        completedPurchases: purchasesData[0]?.completed_purchases || 0,
        pendingPurchases: purchasesData[0]?.pending_purchases || 0,
      },
      monthlyRevenue: monthlyRevenue || [],
      topFiles: topFiles || [],
      recentActivity: recentActivity || [],
    };

    res.json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    next(error);
  }
};

// Get file analytics
export const getFileAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;

    // Get file details with purchase stats
    const [fileData] = await query(`
      SELECT 
        f.*,
        c.name as category_name,
        COUNT(p.id) as total_purchases,
        SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN p.status = 'completed' THEN p.amount ELSE NULL END) as avg_purchase_amount
      FROM files f
      LEFT JOIN categories c ON f.category_id = c.id
      LEFT JOIN purchases p ON f.id = p.file_id
      WHERE f.id = ?
      GROUP BY f.id
    `, [fileId]);

    if (!fileData || fileData.length === 0) {
      throw new AppError('File not found', 404);
    }

    // Get purchase history for this file
    const purchaseHistory = await query(`
      SELECT 
        p.created_at,
        p.amount,
        p.status,
        u.name as user_name,
        u.email as user_email
      FROM purchases p
      JOIN users u ON p.user_id = u.id
      WHERE p.file_id = ?
      ORDER BY p.created_at DESC
    `, [fileId]);

    res.json({
      status: 'success',
      data: {
        file: fileData[0],
        purchaseHistory: purchaseHistory || []
      }
    });
  } catch (error) {
    logger.error('Error fetching file analytics:', error);
    next(error);
  }
};

// Get user analytics
export const getUserAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Get user details with purchase stats
    const [userData] = await query(`
      SELECT 
        u.*,
        COUNT(p.id) as total_purchases,
        SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_spent,
        MAX(p.created_at) as last_purchase_date
      FROM users u
      LEFT JOIN purchases p ON u.id = p.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `, [userId]);

    if (!userData || userData.length === 0) {
      throw new AppError('User not found', 404);
    }

    // Get user's purchase history
    const purchaseHistory = await query(`
      SELECT 
        p.*,
        f.title as file_title,
        f.preview_url
      FROM purchases p
      JOIN files f ON p.file_id = f.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);

    res.json({
      status: 'success',
      data: {
        user: userData[0],
        purchaseHistory: purchaseHistory || []
      }
    });
  } catch (error) {
    logger.error('Error fetching user analytics:', error);
    next(error);
  }
};