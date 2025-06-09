import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Generate a simple invoice from a purchase ID
export const generateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { purchaseId } = req.params;

    const [purchases] = await query(
      `SELECT 
        p.*,
        f.title as file_title,
        f.price as file_price,
        f.description as file_description,
        pr.name as user_name,
        pr.email as user_email
       FROM purchases p 
       JOIN files f ON p.file_id = f.id
       JOIN profiles pr ON p.user_id = pr.id
       WHERE p.id = ?`,
      [purchaseId]
    );

    if (!purchases || purchases.length === 0) {
      throw new AppError('Purchase not found', 404);
    }

    const purchase = purchases[0];

    // Get site settings for invoice details
    const [settings] = await query(
      'SELECT key_name, value FROM site_settings WHERE key_name IN (?, ?, ?)',
      ['site_name', 'currency', 'tax_rate']
    );

    const siteSettings = settings.reduce((acc: any, setting: any) => {
      acc[setting.key_name] = setting.value;
      return acc;
    }, {});

    const invoiceData = {
      id: `INV-${purchase.id}`,
      purchase_id: purchase.id,
      amount: purchase.amount,
      status: purchase.status,
      created_at: purchase.created_at,
      purchase: {
        id: purchase.id,
        file_id: purchase.file_id,
        user_id: purchase.user_id,
        payment_method: purchase.payment_method,
        amount: purchase.amount,
        status: purchase.status,
        created_at: purchase.created_at,
        updated_at: purchase.updated_at,
        file: {
          id: purchase.file_id,
          title: purchase.file_title,
          description: purchase.file_description,
          price: purchase.file_price
        },
        user: {
          id: purchase.user_id,
          name: purchase.user_name,
          email: purchase.user_email
        }
      },
      site_name: siteSettings.site_name || 'File Market',
      currency: siteSettings.currency || 'USD',
      tax_rate: parseFloat(siteSettings.tax_rate || '0')
    };

    res.json({ status: 'success', data: invoiceData });
  } catch (error) {
    logger.error('Error generating invoice:', error);
    next(error);
  }
};

// Get all invoices (for admin)
export const getAllInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, startDate, endDate } = req.query;
    let sql = `
      SELECT 
        p.*,
        f.title as file_title,
        f.price as file_price,
        pr.name as user_name,
        pr.email as user_email
      FROM purchases p 
      JOIN files f ON p.file_id = f.id
      JOIN profiles pr ON p.user_id = pr.id
      WHERE 1=1
    `;
    const params: any[] = [];

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
    
    if (!Array.isArray(purchases)) {
      logger.warn('Unexpected purchases result format:', { type: typeof purchases, purchases });
      return res.json({ status: 'success', data: [] });
    }
    
    const invoices = purchases.map((purchase: any) => ({
      id: `INV-${purchase.id}`,
      purchase_id: purchase.id,
      amount: purchase.amount,
      status: purchase.status,
      created_at: purchase.created_at,
      purchase: {
        id: purchase.id,
        file_id: purchase.file_id,
        user_id: purchase.user_id,
        payment_method: purchase.payment_method,
        amount: purchase.amount,
        status: purchase.status,
        created_at: purchase.created_at,
        updated_at: purchase.updated_at,
        file: {
          id: purchase.file_id,
          title: purchase.file_title,
          price: purchase.file_price
        },
        user: {
          id: purchase.user_id,
          name: purchase.user_name,
          email: purchase.user_email
        }
      }
    }));

    res.json({ status: 'success', data: invoices });
  } catch (error) {
    logger.error('Error getting all invoices:', error);
    next(error);
  }
};

// Get a single invoice by ID (for admin or relevant user)
export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const isAdmin = (req as any).user.is_admin;

    let sql = `
      SELECT 
        p.*,
        f.title as file_title,
        f.price as file_price,
        f.description as file_description,
        pr.name as user_name,
        pr.email as user_email
      FROM purchases p 
      JOIN files f ON p.file_id = f.id
      JOIN profiles pr ON p.user_id = pr.id
      WHERE p.id = ?
    `;
    const params: any[] = [id];

    if (!isAdmin) {
      sql += ` AND p.user_id = ?`;
      params.push(userId);
    }

    const [purchases] = await query(sql, params);

    if (!purchases || purchases.length === 0) {
      throw new AppError('Invoice (purchase) not found', 404);
    }

    const purchase = purchases[0];

    // Get site settings for invoice details
    const [settings] = await query(
      'SELECT key_name, value FROM site_settings WHERE key_name IN (?, ?, ?)',
      ['site_name', 'currency', 'tax_rate']
    );

    const siteSettings = settings.reduce((acc: any, setting: any) => {
      acc[setting.key_name] = setting.value;
      return acc;
    }, {});

    const invoiceData = {
      id: `INV-${purchase.id}`,
      purchase_id: purchase.id,
      amount: purchase.amount,
      status: purchase.status,
      created_at: purchase.created_at,
      purchase: {
        id: purchase.id,
        file_id: purchase.file_id,
        user_id: purchase.user_id,
        payment_method: purchase.payment_method,
        amount: purchase.amount,
        status: purchase.status,
        created_at: purchase.created_at,
        updated_at: purchase.updated_at,
        file: {
          id: purchase.file_id,
          title: purchase.file_title,
          description: purchase.file_description,
          price: purchase.file_price
        },
        user: {
          id: purchase.user_id,
          name: purchase.user_name,
          email: purchase.user_email
        }
      },
      site_name: siteSettings.site_name || 'File Market',
      currency: siteSettings.currency || 'USD',
      tax_rate: parseFloat(siteSettings.tax_rate || '0')
    };

    res.json({ status: 'success', data: invoiceData });
  } catch (error) {
    logger.error('Error getting invoice by ID:', error);
    next(error);
  }
}; 