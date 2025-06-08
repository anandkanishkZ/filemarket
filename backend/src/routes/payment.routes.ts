import express from 'express';
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  createPayment,
  verifyPayment,
  getPayments,
  getPaymentById,
  getPaymentInvoice
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createPaymentSchema,
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
  verifyPaymentSchema
} from '../validators/payment.validator';

const router = express.Router();

// Admin routes
router.get('/methods', authenticate, getPaymentMethods);
router.post('/methods', authenticate, validate(createPaymentMethodSchema), createPaymentMethod);
router.put('/methods/:id', authenticate, validate(updatePaymentMethodSchema), updatePaymentMethod);
router.delete('/methods/:id', authenticate, deletePaymentMethod);
router.post('/:id/verify', authenticate, validate(verifyPaymentSchema), verifyPayment);

// User routes
router.post('/', authenticate, validate(createPaymentSchema), createPayment);
router.get('/', authenticate, getPayments);
router.get('/:id', authenticate, getPaymentById);
router.get('/:id/invoice', authenticate, getPaymentInvoice);

export default router; 