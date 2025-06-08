import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get all purchases (Admin only)
export const getAllPurchases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Admin can see all purchases, optionally filtered by userId
    const { userId } = req.query;
    let sql = `SELECT p.*, f.title as file_title, f.preview_url, u.name as user_name, u.email as user_email
                 FROM purchases p 
                 LEFT JOIN files f ON p.file_id = f.id
                 LEFT JOIN users u ON p.user_id = u.id`;
    const params: any[] = [];

    if (userId) {
      sql += ` WHERE p.user_id = ?`;
      params.push(userId);
    }
    sql += ` ORDER BY p.created_at DESC`;

    const purchases = await query(sql, params);
    logger.debug('Purchases from DB query:', { type: typeof purchases, isArray: Array.isArray(purchases), data: purchases });
    
    // Ensure we're sending an array
    const purchasesArray = Array.isArray(purchases) ? purchases : [purchases];
    res.json({ 
      status: 'success', 
      data: purchasesArray 
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

    let sql = `SELECT p.*, f.title as file_title, f.preview_url, u.name as user_name, u.email as user_email
                 FROM purchases p 
                 LEFT JOIN files f ON p.file_id = f.id
                 LEFT JOIN users u ON p.user_id = u.id
                 WHERE p.id = ?`;
    const params: any[] = [id];

    if (!isAdmin) {
      // If not admin, restrict to their own purchases
      sql += ` AND p.user_id = ?`;
      params.push(userId);
    }

    const [purchases] = await query(sql, params);

    if (purchases.length === 0) {
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
    const { file_id, payment_id, amount } = req.body;

    const [result] = await query(
      `INSERT INTO purchases (user_id, file_id, payment_id, amount, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [userId, file_id, payment_id, amount]
    );

    res.status(201).json({
      status: 'success',
      message: 'Purchase created successfully',
      data: {
        id: result.insertId,
        user_id: userId,
        file_id,
        payment_id,
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

    const [result] = await query(
      'UPDATE purchases SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      throw new AppError('Purchase not found', 404);
    }

    res.json({ status: 'success', message: 'Purchase status updated successfully' });
  } catch (error) {
    logger.error('Error updating purchase status:', error);
    next(error);
  }
};

// Delete purchase (Admin only)
export const deletePurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [result] = await query('DELETE FROM purchases WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw new AppError('Purchase not found', 404);
    }

    res.status(204).json({ status: 'success', message: 'Purchase deleted successfully' });
  } catch (error) {
    logger.error('Error deleting purchase:', error);
    next(error);
  }
}; 