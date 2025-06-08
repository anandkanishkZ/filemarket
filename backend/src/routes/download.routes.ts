import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import {
  downloadFile,
  getDownloadHistory,
  getDownloadStats
} from '../controllers/download.controller';

const router = express.Router();

// Download file (requires authentication)
router.get('/:fileId', authenticate, downloadFile);

// Get user's download history
router.get('/history/me', authenticate, getDownloadHistory);

// Get download statistics (admin only)
router.get('/stats/admin', authenticate, requireAdmin, getDownloadStats);

export default router;