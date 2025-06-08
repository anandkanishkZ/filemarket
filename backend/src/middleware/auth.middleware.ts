import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { AppError } from './error.middleware';
import { logger } from '../utils/logger';

interface JwtPayload {
  id: string;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        is_admin: boolean;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      logger.warn('Authentication failed: No token provided');
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      logger.warn('Authentication failed: Invalid token format');
      throw new AppError('Invalid token format', 401);
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET is not set in environment variables');
      throw new AppError('Server configuration error', 500);
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    if (!decoded || !decoded.id) {
      logger.warn('Authentication failed: Invalid token payload');
      throw new AppError('Invalid token', 401);
    }

    // Get user from database
    const users = await query(
      'SELECT id, email, is_admin FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      logger.warn(`Authentication failed: User not found with id ${decoded.id}`);
      throw new AppError('User not found', 401);
    }    // Add user to request
    req.user = users[0];
    logger.info(`User ${req.user?.email} authenticated successfully`);

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Authentication failed: Invalid token');
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.is_admin) {
    logger.warn(`Access denied: User ${req.user?.email} attempted to access admin route`);
    throw new AppError('Admin access required', 403);
  }
  next();
}; 