import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { logger } from '../utils/logger';

/**
 * Middleware to handle public API requests that should not require authentication
 * This is a workaround for routes that should be public but might have authentication issues
 */
export const handlePublicApiRequests = async (req: Request, res: Response, next: NextFunction) => {
  const publicEndpoints = [
    { path: '/api/categories', method: 'GET' },
    { path: '/api/categories/', method: 'GET' },
  ];

  const isPublicEndpoint = publicEndpoints.some(
    endpoint => req.path.endsWith(endpoint.path) && req.method === endpoint.method
  );

  if (!isPublicEndpoint) {
    return next(); // Not a public endpoint, continue with normal middleware
  }

  logger.info(`Handling public API request: ${req.method} ${req.path}`);

  try {
    // Handle specific public endpoints
    if (req.path.includes('/api/categories') && req.method === 'GET') {
      const categories = await query('SELECT * FROM categories ORDER BY name ASC');
      return res.json({ status: 'success', data: Array.isArray(categories) ? categories : [] });
    }

    // If no specific handler matched but it's in publicEndpoints, let it pass through
    next();
  } catch (error) {
    logger.error(`Error in public API middleware: ${req.path}`, error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
