import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

interface QueryResult {
  insertId: string;
  affectedRows: number;
}

// Get all categories
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [rows] = await query<Category[]>('SELECT * FROM categories ORDER BY name ASC');
    res.json({ 
      status: 'success', 
      data: Array.isArray(rows) ? rows : []
    });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    next(error);
  }
};

// Get category by ID
export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const [rows] = await query<Category[]>('SELECT * FROM categories WHERE id = ?', [id]);

    if (!rows || rows.length === 0) {
      throw new AppError('Category not found', 404);
    }

    res.json({ status: 'success', data: rows[0] });
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
    const [existing] = await query<Category[]>(
      'SELECT id FROM categories WHERE name = ? OR slug = ?', 
      [name, slug]
    );
    if (existing && existing.length > 0) {
      throw new AppError('Category with this name or slug already exists', 400);
    }

    const [result] = await query<QueryResult>(
      `INSERT INTO categories (id, name, slug, description) VALUES (UUID(), ?, ?, ?)`,
      [name, slug, description]
    );

    // Fetch the newly created category
    const [newCategory] = await query<Category[]>(
      'SELECT * FROM categories WHERE id = ?', 
      [result.insertId]
    );

    if (!newCategory || newCategory.length === 0) {
      throw new AppError('Failed to create category', 500);
    }

    res.status(201).json({
      status: 'success',
      data: newCategory[0]
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
    const [existingCategory] = await query<Category[]>(
      'SELECT id FROM categories WHERE id = ?', 
      [id]
    );
    if (!existingCategory || existingCategory.length === 0) {
      throw new AppError('Category not found', 404);
    }

    // Check for duplicate name/slug if they are being updated
    if (name || slug) {
      const [duplicate] = await query<Category[]>(
        'SELECT id FROM categories WHERE (name = ? OR slug = ?) AND id != ?',
        [name, slug, id]
      );
      if (duplicate && duplicate.length > 0) {
        throw new AppError('Another category with this name or slug already exists', 400);
      }
    }

    const [result] = await query<QueryResult>(
      `UPDATE categories SET name = IFNULL(?, name), slug = IFNULL(?, slug), description = IFNULL(?, description) WHERE id = ?`,
      [name, slug, description, id]
    );

    if (result.affectedRows === 0) {
      throw new AppError('Category update failed', 500);
    }

    // Fetch updated category
    const [updatedCategory] = await query<Category[]>(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    res.json({
      status: 'success',
      data: updatedCategory[0]
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

    const [result] = await query<QueryResult>('DELETE FROM categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw new AppError('Category not found', 404);
    }

    res.status(204).json({ status: 'success', message: 'Category deleted successfully' });
  } catch (error) {
    logger.error('Error deleting category:', error);
    next(error);
  }
};