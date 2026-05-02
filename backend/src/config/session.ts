import session from 'express-session';
import MongoStore from 'connect-mongo';

/**
 * Get session configuration
 * Uses MongoDB for session storage with connect-mongo
 * Must be called after database connection is established
 */
export const getSessionConfig = (): session.SessionOptions => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  const sessionExpiry = parseInt(process.env.SESSION_EXPIRY || '604800000', 10);

  return {
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: databaseUrl,
      collectionName: 'sessions',
      ttl: Math.floor(sessionExpiry / 1000), // Convert ms to seconds
      touchAfter: 24 * 3600, // Lazy session update (once per 24 hours)
      crypto: {
        secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
      },
    }),
    cookie: {
      maxAge: sessionExpiry, // 7 days default
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site in production
    },
    name: 'mindfultrader.sid', // Custom session cookie name
  };
};

// Extend session data interface
import mongoose from 'mongoose';

declare module 'express-session' {
  interface SessionData {
    userId: mongoose.Types.ObjectId;
    email: string;
  }
}
