import { Router } from 'express';
import {
  getFiles,
  getFileById,
  createFile,
  updateFile,
  deleteFile,
  downloadFile
} from '../controllers/file.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';
import {
  createFileSchema,
  updateFileSchema
} from '../validators/file.validator';

const router = Router();

// Public routes
router.get('/', getFiles);
router.get('/:id', getFileById);
router.get('/:id/download', authenticate, downloadFile);

// Protected routes (require authentication)
router.post(
  '/',
  authenticate,
  requireAdmin,
  upload.single('file'),
  validateRequest(createFileSchema),
  createFile
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  upload.single('file'),
  validateRequest(updateFileSchema),
  updateFile
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  deleteFile
);

export default router; 