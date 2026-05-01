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

  return {
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: databaseUrl,
      collectionName: 'sessions',
      ttl: parseInt(process.env.SESSION_EXPIRY || '604800000') / 1000, // Convert ms to seconds
    }),
    cookie: {
      maxAge: parseInt(process.env.SESSION_EXPIRY || '604800000'), // 7 days default
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',
    },
    name: 'mindfultrader.sid', // Custom session cookie name
  };
};

// Extend session data interface
declare module 'express-session' {
  interface SessionData {
    userId: mongoose.Types.ObjectId;
    email: string;
  }
}
