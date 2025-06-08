import express from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/settings
router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Get all settings' });
});

// GET /api/settings/:id
router.get('/:id', authenticate, (req, res) => {
  res.json({ message: `Get setting with id: ${req.params.id}` });
});

// POST /api/settings
router.post('/', authenticate, (req, res) => {
  res.json({ message: 'Create a new setting' });
});

// PUT /api/settings/:id
router.put('/:id', authenticate, (req, res) => {
  res.json({ message: `Update setting with id: ${req.params.id}` });
});

// DELETE /api/settings/:id
router.delete('/:id', authenticate, (req, res) => {
  res.json({ message: `Delete setting with id: ${req.params.id}` });
});

export default router; 