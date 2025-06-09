import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get all users (admin only)
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [users] = await query(
      'SELECT id, name, email, is_admin, created_at FROM profiles'
    );

    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID (admin only)
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [users] = await query(
      'SELECT id, name, email, is_admin, created_at FROM profiles WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: users[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update user (admin only)
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, email, is_admin } = req.body;

    // Check if user exists
    const [users] = await query(
      'SELECT * FROM profiles WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      throw new AppError('User not found', 404);
    }

    // Update user
    await query(
      'UPDATE profiles SET name = ?, email = ?, is_admin = ? WHERE id = ?',
      [name, email, is_admin, id]
    );

    res.json({
      status: 'success',
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [users] = await query(
      'SELECT * FROM profiles WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      throw new AppError('User not found', 404);
    }

    // Delete user
    await query('DELETE FROM profiles WHERE id = ?', [id]);

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update profile (user)
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { name, email } = req.body;

    // Check if email is already taken
    if (email) {
      const [existingUsers] = await query(
        'SELECT * FROM profiles WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUsers.length > 0) {
        throw new AppError('Email already taken', 400);
      }
    }

    // Update profile
    await query(
      'UPDATE profiles SET name = ?, email = ? WHERE id = ?',
      [name, email, userId]
    );

    res.json({
      status: 'success',
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Change password (user)
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    // Get user
    const [users] = await query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = users[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
}; 