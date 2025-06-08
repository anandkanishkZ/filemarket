import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get all categories
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {  try {
    // No authentication check - ensure this endpoint always returns data
    let categories: any[] = [];
    try {
      categories = await query('SELECT * FROM categories ORDER BY name ASC');
      logger.info('Categories retrieved successfully:', {
        count: categories.length
      });
    } catch (dbError) {
      logger.error('Error fetching categories from database:', dbError);
      // Continue with empty array if database query fails
    }
    
    // ALWAYS return a data array, even if empty
    res.json({ status: 'success', data: Array.isArray(categories) ? categories : [] });
  } catch (error) {
    logger.error('Error in categories controller:', error);
    next(error);
  }
};

// Get category by ID
export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const [categories] = await query('SELECT * FROM categories WHERE id = ?', [id]);

    if (categories.length === 0) {
      throw new AppError('Category not found', 404);
    }

    res.json({ status: 'success', data: categories[0] });
  } catch (error) {
    logger.error('Error fetching category by ID:', error);
    next(error);
  }
};

// Create a new category (Admin only)
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description } = req.body;
    
    // Check if category name or slug already exists
    const [existing] = await query('SELECT id FROM categories WHERE name = ? OR slug = ?', [name, slug]);
    if (existing.length > 0) {
      throw new AppError('Category with this name or slug already exists', 400);
    }

    const [result] = await query(
      `INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)`,
      [name, slug, description]
    );

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: { id: result.insertId, name, slug, description }
    });
  } catch (error) {
    logger.error('Error creating category:', error);
    next(error);
  }
};

// Update a category (Admin only)
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;

    // Check if category exists
    const [existingCategory] = await query('SELECT id FROM categories WHERE id = ?', [id]);
    if (existingCategory.length === 0) {
      throw new AppError('Category not found', 404);
    }

    // Check for duplicate name/slug if they are being updated
    if (name || slug) {
      const [duplicate] = await query(
        'SELECT id FROM categories WHERE (name = ? OR slug = ?) AND id != ?',
        [name, slug, id]
      );
      if (duplicate.length > 0) {
        throw new AppError('Another category with this name or slug already exists', 400);
      }
    }

    const [result] = await query(
      `UPDATE categories SET name = IFNULL(?, name), slug = IFNULL(?, slug), description = IFNULL(?, description) WHERE id = ?`,
      [name, slug, description, id]
    );

    if (result.affectedRows === 0) {
      throw new AppError('Category update failed', 500);
    }

    res.json({
      status: 'success',
      message: 'Category updated successfully',
      data: { id, name, slug, description }
    });
  } catch (error) {
    logger.error('Error updating category:', error);
    next(error);
  }
};

// Delete a category (Admin only)
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [result] = await query('DELETE FROM categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw new AppError('Category not found', 404);
    }

    res.status(204).json({ status: 'success', message: 'Category deleted successfully' });
  } catch (error) {
    logger.error('Error deleting category:', error);
    next(error);
  }
};