import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { query } from '../config/database';
import { logger } from '../utils/logger';
import {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchaseStatus,
  deletePurchase
} from '../controllers/purchase.controller';

const router = express.Router();

// Get all purchases (Admin only, or user's own purchases if not admin)
router.get('/', authenticate, getAllPurchases);

// Get purchase by ID (Admin only, or user if it's their purchase)
router.get('/:id', authenticate, getPurchaseById);

// Create a new purchase
router.post('/', authenticate, createPurchase);

// Update purchase status (Admin only)
router.put('/:id/status', authenticate, requireAdmin, updatePurchaseStatus);

// Delete a purchase (Admin only)
router.delete('/:id', authenticate, requireAdmin, deletePurchase);

export default router; 