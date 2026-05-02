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
const PORT = process.env.PORT || 3000;

/**
 * Middleware configuration
 */

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
    // Connect to database FIRST
    await database.connect();

    // Initialize session middleware AFTER database connection
    app.use(session(getSessionConfig()));

    /**
     * Routes
     */

    app.get('/', (_req, res) => {
  res.send('MindfulTrader API running 🚀');
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

    // Start listening
    app.listen(PORT, () => {
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
