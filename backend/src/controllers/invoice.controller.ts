import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Generate a simple invoice from a purchase ID
export const generateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { purchaseId } = req.params;

    const [purchases] = await query(
      `SELECT p.*, f.title as file_title, f.price as file_price, f.description as file_description, 
              u.name as user_name, u.email as user_email, u.address as user_address, u.phone as user_phone
       FROM purchases p 
       JOIN files f ON p.file_id = f.id
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [purchaseId]
    );

    if (purchases.length === 0) {
      throw new AppError('Purchase not found', 404);
    }

    const purchase = purchases[0];

    // For a simple invoice, we'll just return the relevant purchase details.
    // In a real application, you might generate a PDF or a more structured invoice object.
    const invoiceData = {
      invoice_id: `INV-${Date.now()}-${purchase.id}`,
      purchase_id: purchase.id,
      user_id: purchase.user_id,
      user_name: purchase.user_name,
      user_email: purchase.user_email,
      user_address: purchase.user_address,
      user_phone: purchase.user_phone,
      file_id: purchase.file_id,
      file_title: purchase.file_title,
      file_description: purchase.file_description,
      item_price: purchase.file_price, // Assuming purchase amount is the file price
      amount_paid: purchase.amount,
      payment_id: purchase.payment_id,
      purchase_status: purchase.status,
      purchase_date: purchase.created_at,
      // Add more invoice specific fields here if needed
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
    // For now, we will simulate invoices by fetching all purchases
    // In a real system, invoices might be a separate table or generated on demand.
    const purchases = await query(
      `SELECT p.*, f.title as file_title, f.price as file_price, 
              u.name as user_name, u.email as user_email
       FROM purchases p 
       JOIN files f ON p.file_id = f.id
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );
    
    // Ensure purchases is an array before trying to map it
    if (!Array.isArray(purchases)) {
      logger.warn('Unexpected purchases result format:', { type: typeof purchases, purchases });
      return res.json({ status: 'success', data: [] });
    }
    
    const invoices = purchases.map((purchase: any) => ({
      invoice_id: `INV-${new Date(purchase.created_at).getTime()}-${purchase.id}`,
      purchase_id: purchase.id,
      user_id: purchase.user_id,
      user_name: purchase.user_name,
      user_email: purchase.user_email,
      file_id: purchase.file_id,
      file_title: purchase.file_title,
      item_price: purchase.file_price,
      amount_paid: purchase.amount,
      purchase_date: purchase.created_at,
      status: purchase.status,
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

    let sql = `SELECT p.*, f.title as file_title, f.price as file_price, f.description as file_description, 
                  u.name as user_name, u.email as user_email, u.address as user_address, u.phone as user_phone
               FROM purchases p 
               JOIN files f ON p.file_id = f.id
               JOIN users u ON p.user_id = u.id
               WHERE p.id = ?`;
    const params: any[] = [id];

    if (!isAdmin) {
      // If not admin, restrict to their own purchases
      sql += ` AND p.user_id = ?`;
      params.push(userId);
    }

    const [purchases] = await query(sql, params);

    if (purchases.length === 0) {
      throw new AppError('Invoice (purchase) not found', 404);
    }

    const purchase = purchases[0];

    const invoiceData = {
      invoice_id: `INV-${purchase.created_at.getTime()}-${purchase.id}`,
      purchase_id: purchase.id,
      user_id: purchase.user_id,
      user_name: purchase.user_name,
      user_email: purchase.user_email,
      user_address: purchase.user_address,
      user_phone: purchase.user_phone,
      file_id: purchase.file_id,
      file_title: purchase.file_title,
      file_description: purchase.file_description,
      item_price: purchase.file_price,
      amount_paid: purchase.amount,
      payment_id: purchase.payment_id,
      purchase_status: purchase.status,
      purchase_date: purchase.created_at,
    };

    res.json({ status: 'success', data: invoiceData });
  } catch (error) {
    logger.error('Error getting invoice by ID:', error);
    next(error);
  }
}; 