import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import {
  generateInvoice,
  getAllInvoices,
  getInvoiceById
} from '../controllers/invoice.controller';

const router = express.Router();

// Admin gets all invoices - temporarily making public for debugging
router.get('/', getAllInvoices);

// Get a specific invoice by ID (Admin or the user who made the purchase)
// For simplicity, we are using the purchase ID as the invoice ID for now.
router.get('/:id', authenticate, getInvoiceById);

// Route to generate an invoice for a specific purchase (might be called after a successful purchase)
router.post('/:purchaseId/generate', authenticate, requireAdmin, generateInvoice);

export default router; 