import { Request, Response, NextFunction } from 'express';
import { query, transaction } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Get all purchases (Admin only)
export const getAllPurchases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, status, startDate, endDate } = req.query;
    let sql = `
      SELECT 
        p.*,
        f.title as file_title,
        f.preview_url,
        pr.name as user_name,
        pr.email as user_email
      FROM purchases p 
      LEFT JOIN files f ON p.file_id = f.id
      LEFT JOIN profiles pr ON p.user_id = pr.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (userId) {
      sql += ` AND p.user_id = ?`;
      params.push(userId);
    }
    if (status) {
      sql += ` AND p.status = ?`;
      params.push(status);
    }
    if (startDate) {
      sql += ` AND p.created_at >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND p.created_at <= ?`;
      params.push(endDate);
    }
    sql += ` ORDER BY p.created_at DESC`;

    const [purchases] = await query(sql, params);
    res.json({ 
      status: 'success', 
      data: Array.isArray(purchases) ? purchases : []
    });
  } catch (error) {
    logger.error('Error fetching all purchases:', error);
    next(error);
  }
};

// Get purchase by ID (Admin only, or user if it's their purchase)
export const getPurchaseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const isAdmin = (req as any).user.is_admin;

    let sql = `
      SELECT 
        p.*,
        f.title as file_title,
        f.preview_url,
        f.download_url,
        pr.name as user_name,
        pr.email as user_email
      FROM purchases p 
      LEFT JOIN files f ON p.file_id = f.id
      LEFT JOIN profiles pr ON p.user_id = pr.id
      WHERE p.id = ?
    `;
    const params: any[] = [id];

    if (!isAdmin) {
      sql += ` AND p.user_id = ?`;
      params.push(userId);
    }

    const [purchases] = await query(sql, params);

    if (!purchases || purchases.length === 0) {
      throw new AppError('Purchase not found', 404);
    }

    res.json({ status: 'success', data: purchases[0] });
  } catch (error) {
    logger.error('Error fetching purchase by ID:', error);
    next(error);
  }
};

// Create purchase
export const createPurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { file_id, payment_method, amount } = req.body;

    // Validate the file exists and is not free
    const [files] = await query('SELECT * FROM files WHERE id = ?', [file_id]);
    if (!files || files.length === 0) {
      throw new AppError('File not found', 404);
    }
    if (files[0].is_free) {
      throw new AppError('Cannot create purchase for free file', 400);
    }

    // Check for existing purchase
    const [existingPurchases] = await query(
      'SELECT id FROM purchases WHERE user_id = ? AND file_id = ?',
      [userId, file_id]
    );
    if (existingPurchases && existingPurchases.length > 0) {
      throw new AppError('You have already purchased this file', 400);
    }

    // Create purchase in a transaction
    const purchaseId = uuidv4();
    await transaction(async (connection) => {
      // Insert purchase
      await connection.execute(
        `INSERT INTO purchases (id, user_id, file_id, payment_method, amount, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [purchaseId, userId, file_id, payment_method, amount]
      );

      // Create initial download record
      await connection.execute(
        `INSERT INTO downloads (id, purchase_id, user_id, file_id, download_count)
         VALUES (?, ?, ?, ?, 0)`,
        [uuidv4(), purchaseId, userId, file_id]
      );
    });

    res.status(201).json({
      status: 'success',
      message: 'Purchase created successfully',
      data: {
        id: purchaseId,
        user_id: userId,
        file_id,
        payment_method,
        amount,
        status: 'pending'
      }
    });
  } catch (error) {
    logger.error('Error creating purchase:', error);
    next(error);
  }
};

// Update purchase status (Admin only)
export const updatePurchaseStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status value', 400);
    }

    const [result] = await query(
      'UPDATE purchases SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      throw new AppError('Purchase not found', 404);
    }

    // If status is completed, update payment status as well
    if (status === 'completed') {
      await query(
        `UPDATE payments p 
         JOIN purchases pu ON p.id = pu.payment_id 
         SET p.status = 'completed', p.verified_at = CURRENT_TIMESTAMP 
         WHERE pu.id = ?`,
        [id]
      );
    }

    res.json({ 
      status: 'success', 
      message: 'Purchase status updated successfully',
      data: { id, status }
    });
  } catch (error) {
    logger.error('Error updating purchase status:', error);
    next(error);
  }
};

// Delete purchase (Admin only)
export const deletePurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if purchase exists
    const [purchases] = await query('SELECT status FROM purchases WHERE id = ?', [id]);
    if (!purchases || purchases.length === 0) {
      throw new AppError('Purchase not found', 404);
    }

    // Don't allow deletion of completed purchases
    if (purchases[0].status === 'completed') {
      throw new AppError('Cannot delete completed purchases', 400);
    }

    const [result] = await query('DELETE FROM purchases WHERE id = ?', [id]);

    res.json({ 
      status: 'success', 
      message: 'Purchase deleted successfully',
      data: { id }
    });
  } catch (error) {
    logger.error('Error deleting purchase:', error);
    next(error);
  }
}; 