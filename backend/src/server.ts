// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';

// Configure dotenv to look in the correct location
// When running from dist/, go up one level to find .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { database } from './config/database';
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

// CORS configuration - simplified for Railway
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        // Log but don't throw error - just deny
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true, // Allow cookies
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (before routes)
app.use((req, _res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.path} from ${req.ip}`);
  next();
});

/**
 * Start server
 */
const startServer = async () => {
  try {
    logger.info('Starting MindfulTrader API server...');
    logger.info(`Node environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Port: ${PORT}`);

    // Add simple health check BEFORE database connection
    // This ensures Railway can check health even if DB is slow
    app.get('/ping', (_req, res) => {
      res.send('pong');
    });

    app.get('/', (_req, res) => {
      res.json({
        name: 'MindfulTrader API',
        status: 'running',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
      });
    });

    // Connect to database FIRST
    logger.info('Connecting to database...');
    await database.connect();
    logger.info('Database connection successful');

    // Import and initialize session AFTER database connection
    logger.info('Initializing session store...');
    const session = require('express-session');
    const { getSessionConfig } = require('./config/session');
    app.use(session(getSessionConfig()));
    logger.info('Session store initialized');

    /**
     * Routes
     */
    // Detailed health check (with database status)
    app.get('/health', (_req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: database.getConnectionStatus() ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
      });
    });

    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/trades', tradeRoutes);
    app.use('/api/insights', insightsRoutes);
    app.use('/api/user/profile', profileRoutes);
    app.use('/api/wallet', walletRoutes);

    /**
     * Error handling
     */
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Start listening on all interfaces (0.0.0.0) for Railway
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`✅ Server started successfully on port ${PORT}`);
      logger.info(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`✅ Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      logger.info(`✅ Server is ready to accept connections`);
      logger.info(`✅ Health check available at: http://0.0.0.0:${PORT}/health`);
    });

    // Keep the server alive
    server.keepAliveTimeout = 65000; // 65 seconds
    server.headersTimeout = 66000; // 66 seconds

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });

    // Log when server is closing
    server.on('close', () => {
      logger.info('Server is closing...');
    });

    return server;

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Don't exit immediately in production, log and continue
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately in production, log and continue
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  try {
    await database.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  try {
    await database.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server
startServer().catch((error) => {
  logger.error('Fatal error during startup:', error);
  process.exit(1);
});

export default app;
