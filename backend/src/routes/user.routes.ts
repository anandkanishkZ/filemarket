import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { query } from '../config/database';
import { logger } from '../utils/logger';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [users] = await query(
      `SELECT id, name, email, is_admin, is_active, created_at, updated_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    res.json({ status: 'success', data: users });
  } catch (error) {
    logger.error('Error fetching all users:', error);
    next(error);
  }
});

// GET /api/users/:id
router.get('/:id', authenticate, (req, res) => {
  res.json({ message: `Get user with id: ${req.params.id}` });
});

// POST /api/users
router.post('/', authenticate, (req, res) => {
  res.json({ message: 'Create a new user' });
});

// PUT /api/users/:id
router.put('/:id', authenticate, (req, res) => {
  res.json({ message: `Update user with id: ${req.params.id}` });
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, (req, res) => {
  res.json({ message: `Delete user with id: ${req.params.id}` });
});

export default router; 