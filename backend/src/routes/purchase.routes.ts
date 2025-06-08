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
router.get('/', authenticate, async (req, res, next) => {
  // If user is admin, allow them to query all purchases or specific user's purchases
  // If user is not admin, they can only query their own purchases
  if ((req as any).user.is_admin) {
    getAllPurchases(req, res, next);
  } else {
    // Override userId query param to ensure non-admins only see their own purchases
    req.query.userId = (req as any).user.id;
    getAllPurchases(req, res, next);
  }
});

// Get purchase by ID (Admin only, or user if it's their purchase)
router.get('/:id', authenticate, getPurchaseById);

// Create a new purchase
router.post('/', authenticate, createPurchase);

// Update purchase status (Admin only)
router.put('/:id/status', authenticate, requireAdmin, updatePurchaseStatus);

// Delete a purchase (Admin only)
router.delete('/:id', authenticate, requireAdmin, deletePurchase);

export default router; 