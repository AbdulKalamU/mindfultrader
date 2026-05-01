import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Extend Express Request to include user data
 */
declare global {
  namespace Express {
    interface Request {
      userId?: mongoose.Types.ObjectId;
      userEmail?: string;
    }
  }
}

/**
 * Authentication middleware
 * Validates session and attaches user data to request
 * Returns 401 if session is invalid or missing
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if session exists
    if (!req.session || !req.session.userId) {
      res.status(401).json({
        error: 'Authentication Error',
        message: 'Authentication required. Please log in.',
      });
      return;
    }

    // Validate session and get user
    const user = await authService.validateSession(req.session.userId);

    if (!user) {
      // Session exists but user not found (deleted account)
      req.session.destroy((err) => {
        if (err) {
          logger.error('Error destroying invalid session:', err);
        }
      });

      res.status(401).json({
        error: 'Authentication Error',
        message: 'Session expired. Please log in again.',
      });
      return;
    }

    // Attach user data to request
    req.userId = user._id;
    req.userEmail = user.email;

    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during authentication.',
    });
  }
};
