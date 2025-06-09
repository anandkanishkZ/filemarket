import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { query } from '../config/database';
import { logger } from '../utils/logger';

interface InvoiceDetails {
  purchase_id: string;
  amount: number;
  purchase_status: string;
  created_at: Date;
  file_title: string;
  preview_url: string;
  download_url?: string;
  user_name: string;
  user_email: string;
  payment_method: string;
  transaction_id: string;
  payment_details: string;
  payment_instructions?: string;
  verified_at: Date;
  download_count?: number;
  last_downloaded_at?: Date;
}

const router = express.Router();

// Get all invoices (Admin only)
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await query<InvoiceDetails[]>(`
      SELECT 
        p.id as purchase_id,
        p.amount,
        p.status as purchase_status,
        p.created_at,
        f.title as file_title,
        f.preview_url,
        u.name as user_name,
        u.email as user_email,
        pm.name as payment_method,
        py.transaction_id,
        py.payment_details,
        py.verified_at
      FROM purchases p
      LEFT JOIN files f ON p.file_id = f.id
      LEFT JOIN profiles u ON p.user_id = u.id
      LEFT JOIN payments py ON p.payment_id = py.id
      LEFT JOIN payment_methods pm ON py.payment_method_id = pm.id
      ORDER BY p.created_at DESC
    `);

    res.json({
      status: 'success',
      data: Array.isArray(rows) ? rows : []
    });
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    next(error);
  }
});

// Get invoice by ID (Admin only)
router.get('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await query<InvoiceDetails[]>(`
      SELECT 
        p.id as purchase_id,
        p.amount,
        p.status as purchase_status,
        p.created_at,
        f.title as file_title,
        f.preview_url,
        f.download_url,
        u.name as user_name,
        u.email as user_email,
        pm.name as payment_method,
        py.transaction_id,
        py.payment_details,
        py.payment_instructions,
        py.verified_at,
        d.download_count,
        d.last_downloaded_at
      FROM purchases p
      LEFT JOIN files f ON p.file_id = f.id
      LEFT JOIN profiles u ON p.user_id = u.id
      LEFT JOIN payments py ON p.payment_id = py.id
      LEFT JOIN payment_methods pm ON py.payment_method_id = pm.id
      LEFT JOIN downloads d ON p.id = d.purchase_id
      WHERE p.id = ?
    `, [id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Invoice not found'
      });
    }

    res.json({
      status: 'success',
      data: rows[0]
    });
  } catch (error) {
    logger.error('Error fetching invoice by ID:', error);
    next(error);
  }
});

export default router; 