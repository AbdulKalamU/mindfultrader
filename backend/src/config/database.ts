import mongoose from 'mongoose';
import { logger } from '../utils/logger';

/**
 * Database configuration and connection management
 */
export class Database {
  private static instance: Database;
  private isConnected = false;

  private constructor() {}

  /**
   * Get singleton instance of Database
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Connect to MongoDB database
   * Implements connection pooling and error handling
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not defined');
    }

    try {
      await mongoose.connect(databaseUrl, {
        maxPoolSize: 10, // Connection pooling
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;
      logger.info('Database connected successfully');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        logger.error('Database connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('Database disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('Database reconnected');
        this.isConnected = true;
      });
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw new Error('Database connection failed');
    }
  }

  /**
   * Disconnect from MongoDB database
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

export const database = Database.getInstance();
