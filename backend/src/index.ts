import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query, testConnection, healthCheck, initializeDatabase } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import { handlePublicApiRequests } from './middleware/public-api.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import fileRoutes from './routes/file.routes';
import categoryRoutes from './routes/category.routes';
import purchaseRoutes from './routes/purchase.routes';
import settingsRoutes from './routes/settings.routes';
import paymentRoutes from './routes/payment.routes';
import invoiceRoutes from './routes/invoice.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Handle public API requests without requiring authentication
app.use(handlePublicApiRequests);

// Health check route
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const dbHealth = await healthCheck();
    res.json({ 
      status: dbHealth.status,
      database: dbHealth.message,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (err) {
    logger.error('Health check failed:', err);
    res.status(500).json({ 
      status: 'error', 
      error: 'Health check failed' 
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

// Error handling
app.use(errorHandler);

// Catch-all for unhandled routes (must be after all specific routes)
app.use((req: Request, res: Response, next) => {
  logger.warn(`Unhandled route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Initialize database connection
initializeDatabase()
  .then(() => {
    logger.info('Database initialized successfully');
  })
  .catch((error) => {
    logger.error('Failed to initialize database:', error);
    process.exit(1);
  });

// Check database connection before starting server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (dbConnected) {
      logger.info('✅ Database connection successful');
    } else {
      logger.warn('⚠️  Database connection failed - starting server anyway');
      logger.warn('💡 Make sure MySQL is running on your system');
      logger.warn('💡 Check your database credentials in .env file');
    }
    
    // Start server regardless of database connection
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📝 API Documentation: http://localhost:${PORT}/api-docs`);
      
      if (!dbConnected) {
        logger.warn('⚠️  Server started without database connection');
        logger.warn('💡 To fix: Start MySQL service and restart the server');
      }
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();