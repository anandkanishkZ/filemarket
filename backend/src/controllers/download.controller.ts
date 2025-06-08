import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

// Download file
export const downloadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;
    const userId = (req as any).user.id;

    // Get file details
    const [files] = await query(
      'SELECT * FROM files WHERE id = ?',
      [fileId]
    );

    if (files.length === 0) {
      throw new AppError('File not found', 404);
    }

    const file = files[0];

    // Check if file is free or user has purchased it
    if (!file.is_free) {
      const [purchases] = await query(
        'SELECT * FROM purchases WHERE user_id = ? AND file_id = ? AND status = ?',
        [userId, fileId, 'completed']
      );

      if (purchases.length === 0) {
        throw new AppError('You have not purchased this file', 403);
      }

      const purchase = purchases[0];

      // Check download limit if applicable
      if (file.download_limit_days && file.download_limit_days > 0) {
        const purchaseDate = new Date(purchase.created_at);
        const expiryDate = new Date(purchaseDate.getTime() + file.download_limit_days * 24 * 60 * 60 * 1000);
        const now = new Date();

        if (now > expiryDate) {
          throw new AppError('Download link has expired', 403);
        }
      }
    }

    // Check if file exists on disk
    const filePath = path.join(__dirname, '../../uploads', path.basename(file.download_url));
    
    if (!fs.existsSync(filePath)) {
      throw new AppError('File not found on server', 404);
    }

    // Log download
    await query(
      `INSERT INTO downloads (user_id, file_id, download_count, last_downloaded_at) 
       VALUES (?, ?, 1, NOW()) 
       ON DUPLICATE KEY UPDATE 
       download_count = download_count + 1, 
       last_downloaded_at = NOW()`,
      [userId, fileId]
    );

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.title}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      logger.error('Error streaming file:', error);
      if (!res.headersSent) {
        next(new AppError('Error downloading file', 500));
      }
    });

  } catch (error) {
    logger.error('Error in downloadFile:', error);
    next(error);
  }
};

// Get download history for user
export const getDownloadHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const downloads = await query(`
      SELECT 
        d.*,
        f.title as file_title,
        f.preview_url,
        f.price
      FROM downloads d
      JOIN files f ON d.file_id = f.id
      WHERE d.user_id = ?
      ORDER BY d.last_downloaded_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit as string), offset]);

    const [countResult] = await query(
      'SELECT COUNT(*) as total FROM downloads WHERE user_id = ?',
      [userId]
    );

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / parseInt(limit as string));

    res.json({
      status: 'success',
      data: {
        downloads: downloads || [],
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages,
          hasNext: parseInt(page as string) < totalPages,
          hasPrev: parseInt(page as string) > 1
        }
      }
    });
  } catch (error) {
    logger.error('Error getting download history:', error);
    next(error);
  }
};

// Get download statistics (admin only)
export const getDownloadStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Most downloaded files
    const topDownloads = await query(`
      SELECT 
        f.id,
        f.title,
        f.preview_url,
        SUM(d.download_count) as total_downloads,
        COUNT(DISTINCT d.user_id) as unique_users
      FROM files f
      JOIN downloads d ON f.id = d.file_id
      GROUP BY f.id, f.title, f.preview_url
      ORDER BY total_downloads DESC
      LIMIT 10
    `);

    // Download trends (last 30 days)
    const downloadTrends = await query(`
      SELECT 
        DATE(d.last_downloaded_at) as download_date,
        COUNT(*) as downloads
      FROM downloads d
      WHERE d.last_downloaded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(d.last_downloaded_at)
      ORDER BY download_date ASC
    `);

    // Total download stats
    const [totalStats] = await query(`
      SELECT 
        SUM(download_count) as total_downloads,
        COUNT(DISTINCT user_id) as total_users,
        COUNT(DISTINCT file_id) as files_downloaded
      FROM downloads
    `);

    res.json({
      status: 'success',
      data: {
        topDownloads: topDownloads || [],
        downloadTrends: downloadTrends || [],
        totalStats: totalStats || {}
      }
    });
  } catch (error) {
    logger.error('Error getting download stats:', error);
    next(error);
  }
};