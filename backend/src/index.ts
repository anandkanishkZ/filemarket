import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimiter.middleware';
import { securityHeaders, corsOptions, sanitizeInput } from './middleware/security.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import fileRoutes from './routes/file.routes';
import categoryRoutes from './routes/category.routes';
import purchaseRoutes from './routes/purchase.routes';
import settingsRoutes from './routes/settings.routes';
import paymentRoutes from './routes/payment.routes';
import invoiceRoutes from './routes/invoice.routes';
import analyticsRoutes from './routes/analytics.routes';
import searchRoutes from './routes/search.routes';
import downloadRoutes from './routes/download.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Request logging
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Serve static files
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await query('SELECT 1');
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (err) {
    logger.error('Health check failed:', err);
    res.status(500).json({ 
      status: 'error', 
      error: 'Database connection failed' 
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/download', downloadRoutes);

// Error handling
app.use(errorHandler);

// Catch-all for unhandled routes
app.use((req: Request, res: Response) => {
  logger.warn(`Unhandled route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}` 
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Check database connection before starting server
async function startServer() {
  try {
    // Test database connection
    await query('SELECT 1');
    logger.info('✅ Database connection successful');
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📝 API Documentation: http://localhost:${PORT}/api/health`);
      logger.info(`📁 File uploads: http://localhost:${PORT}/uploads`);
    });
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

startServer();