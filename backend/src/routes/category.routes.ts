import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller';

const router = express.Router();

// Public route to get all categories (anyone can browse categories)
router.get('/', getCategories); // No authenticate middleware here

// Public route to get a category by ID
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', authenticate, requireAdmin, createCategory);
router.put('/:id', authenticate, requireAdmin, updateCategory);
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

export default router;