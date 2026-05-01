import { Router, Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new user account
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required',
        fields: {
          email: !email ? 'Email is required' : undefined,
          password: !password ? 'Password is required' : undefined,
        },
      });
    }

    // Create user
    const user = await authService.signup(email, password);

    // Create session
    req.session.userId = user._id;
    req.session.email = user.email;

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
      },
      message: 'Account created successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Email already registered')) {
        return res.status(409).json({
          error: 'Conflict',
          message: error.message,
        });
      }
      if (error.message.includes('Invalid email') || error.message.includes('Password must')) {
        return res.status(400).json({
          error: 'Validation Error',
          message: error.message,
        });
      }
    }

    logger.error('Signup endpoint error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during signup. Please try again.',
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required',
      });
    }

    // Authenticate user
    const sessionData = await authService.login(email, password);

    // Create session
    req.session.userId = sessionData.userId;
    req.session.email = sessionData.email;

    res.status(200).json({
      user: {
        id: sessionData.userId,
        email: sessionData.email,
      },
      message: 'Login successful',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid credentials')) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'Invalid email or password',
      });
    }

    logger.error('Login endpoint error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during login. Please try again.',
    });
  }
});

/**
 * POST /api/auth/logout
 * Terminate user session
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        logger.error('Error destroying session:', err);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'An error occurred during logout.',
        });
      }

      // Call logout service for any cleanup
      if (userId) {
        authService.logout(userId).catch((error) => {
          logger.error('Logout service error:', error);
        });
      }

      res.status(200).json({
        message: 'Logout successful',
      });
    });
  } catch (error) {
    logger.error('Logout endpoint error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during logout.',
    });
  }
});

export default router;
