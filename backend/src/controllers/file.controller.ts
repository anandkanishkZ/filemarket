import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Get all files
export const getFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [files] = await query(
      `SELECT f.*, c.name as category_name 
       FROM files f 
       LEFT JOIN categories c ON f.category_id = c.id 
       ORDER BY f.created_at DESC`
    );

    res.json({
      status: 'success',
      data: files
    });
  } catch (error) {
    logger.error('Error fetching files:', error);
    next(error);
  }
};

// Get file by ID
export const getFileById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [files] = await query(
      `SELECT f.*, c.name as category_name 
       FROM files f 
       LEFT JOIN categories c ON f.category_id = c.id 
       WHERE f.id = ?`,
      [id]
    );

    if (files.length === 0) {
      throw new AppError('File not found', 404);
    }

    res.json({
      status: 'success',
      data: files[0]
    });
  } catch (error) {
    logger.error('Error fetching file by ID:', error);
    next(error);
  }
};

// Create file
export const createFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, category_id, price, is_free, is_downloadable, download_limit_days } = req.body;
    const file = req.file;

    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    // Construct download_url
    const download_url = `/uploads/${file.filename}`;
    const preview_url = download_url; // For simplicity, using the same for now

    // Create file record
    const [result] = await query(
      `INSERT INTO files (
        title, description, category_id, price, is_free,
        file_name, file_path, file_size, file_type, preview_url, download_url,
        is_downloadable, download_limit_days
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        category_id,
        price,
        is_free,
        file.originalname,
        file.path,
        file.size,
        file.mimetype,
        preview_url,
        download_url,
        is_downloadable || false,
        download_limit_days || null
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'File created successfully',
      data: {
        id: result.insertId,
        title,
        description,
        category_id,
        price,
        is_free,
        file_name: file.originalname,
        file_path: file.path,
        file_size: file.size,
        file_type: file.mimetype,
        preview_url,
        download_url,
        is_downloadable: is_downloadable || false,
        download_limit_days: download_limit_days || null
      }
    });
  } catch (error) {
    // Delete uploaded file if database operation fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) logger.error('Error deleting file:', err);
      });
    }
    logger.error('Error creating file:', error);
    next(error);
  }
};

// Update file
export const updateFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, category_id, price, is_free, is_downloadable, download_limit_days } = req.body;
    const file = req.file;

    // Check if file exists
    const [files] = await query(
      'SELECT * FROM files WHERE id = ?',
      [id]
    );

    if (files.length === 0) {
      throw new AppError('File not found', 404);
    }

    const oldFile = files[0];

    let updateFields: string[] = [];
    let updateValues: any[] = [];

    if (title !== undefined) { updateFields.push('title = ?'); updateValues.push(title); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (category_id !== undefined) { updateFields.push('category_id = ?'); updateValues.push(category_id); }
    if (price !== undefined) { updateFields.push('price = ?'); updateValues.push(price); }
    if (is_free !== undefined) { updateFields.push('is_free = ?'); updateValues.push(is_free); }
    if (is_downloadable !== undefined) { updateFields.push('is_downloadable = ?'); updateValues.push(is_downloadable); }
    if (download_limit_days !== undefined) { updateFields.push('download_limit_days = ?'); updateValues.push(download_limit_days); }

    if (file) {
      // Delete old file
      if (oldFile.file_path && fs.existsSync(oldFile.file_path)) {
        fs.unlink(oldFile.file_path, (err) => {
          if (err) logger.error('Error deleting old file:', err);
        });
      }

      // Add new file details to update
      updateFields.push('file_name = ?', 'file_path = ?', 'file_size = ?', 'file_type = ?', 'preview_url = ?', 'download_url = ?');
      updateValues.push(file.originalname, file.path, file.size, file.mimetype, `/uploads/${file.filename}`, `/uploads/${file.filename}`);
    }

    if (updateFields.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No changes provided for update'
      });
    }

    await query(
      `UPDATE files SET ${updateFields.join(', ')} WHERE id = ?`,
      [...updateValues, id]
    );

    res.json({
      status: 'success',
      message: 'File updated successfully'
    });
  } catch (error) {
    // Delete uploaded file if database operation fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) logger.error('Error deleting new file:', err);
      });
    }
    logger.error('Error updating file:', error);
    next(error);
  }
};

// Delete file
export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Get file details
    const [files] = await query(
      'SELECT * FROM files WHERE id = ?',
      [id]
    );

    if (files.length === 0) {
      throw new AppError('File not found', 404);
    }

    const file = files[0];

    // Delete physical file
    if (file.file_path && fs.existsSync(file.file_path)) {
      fs.unlink(file.file_path, (err) => {
        if (err) logger.error('Error deleting file:', err);
      });
    }

    // Delete file record
    const [result] = await query('DELETE FROM files WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw new AppError('File deletion failed', 500);
    }

    res.status(204).json({ status: 'success', message: 'File deleted successfully' });
  } catch (error) {
    logger.error('Error deleting file:', error);
    next(error);
  }
};

// Download file
export const downloadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Get file details
    const [files] = await query(
      'SELECT id, file_path, file_name, is_downloadable FROM files WHERE id = ?',
      [id]
    );

    if (files.length === 0) {
      throw new AppError('File not found', 404);
    }

    const file = files[0];

    if (!file.is_downloadable) {
      throw new AppError('This file is not available for download', 403);
    }

    // Check if user has purchased this file
    const [purchases] = await query(
      'SELECT created_at, download_limit_days FROM purchases WHERE user_id = ? AND file_id = ? AND status = ?',
      [userId, id, 'completed']
    );

    if (purchases.length === 0) {
      throw new AppError('You have not purchased this file', 403);
    }

    const purchase = purchases[0];

    // Check download limit days
    if (purchase.download_limit_days !== null && purchase.download_limit_days > 0) {
      const purchaseDate = new Date(purchase.created_at);
      const expiryDate = new Date(purchaseDate.getTime() + purchase.download_limit_days * 24 * 60 * 60 * 1000);
      const now = new Date();

      if (now > expiryDate) {
        throw new AppError('Download link has expired', 403);
      }
    }

    const filePath = path.join(UPLOADS_DIR, path.basename(file.file_path));

    if (!fs.existsSync(filePath)) {
      throw new AppError('File not found on server', 404);
    }

    res.download(filePath, file.file_name, (err) => {
      if (err) {
        logger.error('Error downloading file:', err);
        if (!res.headersSent) {
          next(new AppError('Failed to download file', 500));
        }
      }
    });
  } catch (error) {
    logger.error('Error in downloadFile:', error);
    next(error);
  }
}; 