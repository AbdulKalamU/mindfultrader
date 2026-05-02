// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';

// Configure dotenv to look in the correct location
// When running from dist/, go up one level to find .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import { database } from './config/database';
import { getSessionConfig } from './config/session';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import tradeRoutes from './routes/trades';
import insightsRoutes from './routes/insights';
import profileRoutes from './routes/profile';
import walletRoutes from './routes/wallet';

/**
 * Express application setup
 */
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Trust Railway proxy for secure cookies
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

/**
 * Middleware configuration
 */

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Start server
 */
const startServer = async () => {
  try {
    logger.info('Starting MindfulTrader API server...');
    logger.info(`Node environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Port: ${PORT}`);

    // Connect to database FIRST
    logger.info('Connecting to database...');
    await database.connect();
    logger.info('Database connection successful');

    // Initialize session middleware AFTER database connection
    logger.info('Initializing session store...');
    app.use(session(getSessionConfig()));
    logger.info('Session store initialized');

    /**
     * Routes
     */
    // Root endpoint
    app.get('/', (_req, res) => {
      res.json({
        name: 'MindfulTrader API',
        status: 'running',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
      });
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/trades', tradeRoutes);
    app.use('/api/insights', insightsRoutes);
    app.use('/api/user/profile', profileRoutes);
    app.use('/api/wallet', walletRoutes);

    // Health check endpoint
    app.get('/health', (_req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: database.getConnectionStatus() ? 'connected' : 'disconnected',
      });
    });

    /**
     * Error handling
     */
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Start listening on all interfaces (0.0.0.0) for Railway
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server started on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await database.disconnect();
  process.exit(0);
});

// Start the server
startServer();

export default app;
