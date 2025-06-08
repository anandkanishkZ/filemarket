import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import {
  getDashboardAnalytics,
  getFileAnalytics,
  getUserAnalytics
} from '../controllers/analytics.controller';

const router = express.Router();

// All analytics routes require admin access
router.use(authenticate, requireAdmin);

// Dashboard analytics
router.get('/dashboard', getDashboardAnalytics);

// File analytics
router.get('/files/:fileId', getFileAnalytics);

// User analytics
router.get('/users/:userId', getUserAnalytics);

export default router;