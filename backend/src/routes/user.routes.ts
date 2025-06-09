import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { query } from '../config/database';
import { logger } from '../utils/logger';

interface User {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface QueryResult {
  insertId: number;
}

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await query<User[]>(
      `SELECT id, name, email, is_admin, is_active, created_at, updated_at 
       FROM profiles 
       ORDER BY created_at DESC`
    );
    res.json({ status: 'success', data: Array.isArray(rows) ? rows : [] });
  } catch (error) {
    logger.error('Error fetching all users:', error);
    next(error);
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const [rows] = await query<User[]>(
      `SELECT id, name, email, is_admin, is_active, created_at, updated_at 
       FROM profiles 
       WHERE id = ?`,
      [req.params.id]
    );

    if (!rows || rows.length === 0) {
      res.status(404).json({ 
        status: 'error',
        message: 'User not found'
      });
      return;
    }

    res.json({ 
      status: 'success',
      data: rows[0]
    });
  } catch (error) {
    logger.error('Error fetching user:', error);
    next(error);
  }
});

// Create new user (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { name, email, password, is_admin } = req.body;

    // Check if user exists
    const [rows] = await query<User[]>(
      'SELECT id FROM profiles WHERE email = ?',
      [email]
    );

    if (rows && rows.length > 0) {
      res.status(400).json({
        status: 'error',
        message: 'Email already registered'
      });
      return;
    }

    // Create user
    const [result] = await query<QueryResult>(
      'INSERT INTO profiles (id, name, email, password, is_admin) VALUES (UUID(), ?, ?, ?, ?)',
      [name, email, password, is_admin || false]
    );

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    next(error);
  }
});

// Update user (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { name, email, is_admin, is_active } = req.body;

    // Check if user exists
    const [rows] = await query<User[]>(
      'SELECT id FROM profiles WHERE id = ?',
      [req.params.id]
    );

    if (!rows || rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }

    // Update user
    await query(
      'UPDATE profiles SET name = ?, email = ?, is_admin = ?, is_active = ? WHERE id = ?',
      [name, email, is_admin, is_active, req.params.id]
    );

    res.json({
      status: 'success',
      message: 'User updated successfully'
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    next(error);
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    // Check if user exists
    const [rows] = await query<User[]>(
      'SELECT id FROM profiles WHERE id = ?',
      [req.params.id]
    );

    if (!rows || rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }

    // Delete user
    await query('DELETE FROM profiles WHERE id = ?', [req.params.id]);

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    next(error);
  }
});

export default router; 