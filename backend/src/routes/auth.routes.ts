import { Router } from 'express';
import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword,
  verifyEmail,
  refreshToken,
  logout
} from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from '../validators/auth.validator';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.post('/refresh-token', authenticate, refreshToken);
router.post('/logout', authenticate, logout);

export default router; 