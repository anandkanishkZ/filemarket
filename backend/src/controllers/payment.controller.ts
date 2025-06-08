import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { generateInvoice } from '../utils/invoice';

// Get all payment methods (admin)
export const getPaymentMethods = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [methods] = await query(
      'SELECT * FROM payment_methods WHERE is_active = true'
    );

    res.json({
      status: 'success',
      data: methods
    });
  } catch (error) {
    next(error);
  }
};

// Create payment method (admin)
export const createPaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type, details, instructions } = req.body;

    const [result] = await query(
      `INSERT INTO payment_methods (name, type, details, instructions)
       VALUES (?, ?, ?, ?)`,
      [name, type, details, instructions]
    );

    res.status(201).json({
      status: 'success',
      message: 'Payment method created successfully',
      data: {
        id: result.insertId,
        name,
        type,
        details,
        instructions
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update payment method (admin)
export const updatePaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, type, details, instructions, is_active } = req.body;

    await query(
      `UPDATE payment_methods 
       SET name = ?, type = ?, details = ?, instructions = ?, is_active = ?
       WHERE id = ?`,
      [name, type, details, instructions, is_active, id]
    );

    res.json({
      status: 'success',
      message: 'Payment method updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete payment method (admin)
export const deletePaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM payment_methods WHERE id = ?', [id]);

    res.json({
      status: 'success',
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Create payment
export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { file_id, payment_method_id } = req.body;

    // Get file details
    const [files] = await query(
      'SELECT * FROM files WHERE id = ?',
      [file_id]
    );

    if (files.length === 0) {
      throw new AppError('File not found', 404);
    }

    const file = files[0];

    // Check if already purchased
    const [existingPurchases] = await query(
      'SELECT * FROM purchases WHERE file_id = ? AND user_id = ? AND status = "completed"',
      [file_id, userId]
    );

    if (existingPurchases.length > 0) {
      throw new AppError('You have already purchased this file', 400);
    }

    // Get payment method
    const [methods] = await query(
      'SELECT * FROM payment_methods WHERE id = ? AND is_active = true',
      [payment_method_id]
    );

    if (methods.length === 0) {
      throw new AppError('Invalid payment method', 400);
    }

    const method = methods[0];

    // Create payment record
    const [result] = await query(
      `INSERT INTO payments (
        user_id, file_id, payment_method_id, amount, status,
        payment_details, payment_instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        file_id,
        payment_method_id,
        file.price,
        'pending',
        JSON.stringify(method.details),
        method.instructions
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'Payment created successfully',
      data: {
        id: result.insertId,
        amount: file.price,
        payment_method: method.name,
        instructions: method.instructions,
        details: method.details
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verify payment (admin)
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { transaction_id, status, notes } = req.body;

    // Get payment details
    const [payments] = await query(
      'SELECT * FROM payments WHERE id = ?',
      [id]
    );

    if (payments.length === 0) {
      throw new AppError('Payment not found', 404);
    }

    const payment = payments[0];

    if (payment.status !== 'pending') {
      throw new AppError('Payment is not pending', 400);
    }

    // Update payment status
    await query(
      `UPDATE payments 
       SET status = ?, transaction_id = ?, admin_notes = ?, verified_at = NOW()
       WHERE id = ?`,
      [status, transaction_id, notes, id]
    );

    // If payment is approved, create purchase record
    if (status === 'completed') {
      await query(
        `INSERT INTO purchases (
          user_id, file_id, payment_id, amount, status
        ) VALUES (?, ?, ?, ?, ?)`,
        [payment.user_id, payment.file_id, id, payment.amount, 'completed']
      );
    }

    res.json({
      status: 'success',
      message: 'Payment verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user payments
export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const [payments] = await query(
      `SELECT p.*, f.title as file_title, pm.name as payment_method_name
       FROM payments p
       LEFT JOIN files f ON p.file_id = f.id
       LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({
      status: 'success',
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// Get payment by ID
export const getPaymentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const [payments] = await query(
      `SELECT p.*, f.title as file_title, pm.name as payment_method_name
       FROM payments p
       LEFT JOIN files f ON p.file_id = f.id
       LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
       WHERE p.id = ? AND p.user_id = ?`,
      [id, userId]
    );

    if (payments.length === 0) {
      throw new AppError('Payment not found', 404);
    }

    res.json({
      status: 'success',
      data: payments[0]
    });
  } catch (error) {
    next(error);
  }
};

// Get payment invoice
export const getPaymentInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Get payment details with user and file info
    const [payments] = await query(
      `SELECT p.*, f.title as file_title, pm.name as payment_method_name,
              u.name as user_name, u.email as user_email
       FROM payments p
       LEFT JOIN files f ON p.file_id = f.id
       LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ? AND p.user_id = ?`,
      [id, userId]
    );

    if (payments.length === 0) {
      throw new AppError('Payment not found', 404);
    }

    const payment = payments[0];

    // Generate invoice
    const invoice = await generateInvoice(payment);

    res.json({
      status: 'success',
      data: invoice
    });
  } catch (error) {
    next(error);
  }
}; 