import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { query } from '../config/database';
import { logger } from '../utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  createFileSchema,
  updateFileSchema
} from '../validators/file.validator';
import { validateRequest } from '../middleware/validate.middleware';
import {
  getFiles,
  getFileById,
  createFile,
  updateFile,
  deleteFile,
  downloadFile
} from '../controllers/file.controller';

interface File {
  id: string;
  title: string;
  description: string;
  category_id: string;
  price: number;
  preview_url: string;
  download_url: string;
  created_at: Date;
  updated_at: Date;
}

interface QueryResult {
  insertId: number;
}

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

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