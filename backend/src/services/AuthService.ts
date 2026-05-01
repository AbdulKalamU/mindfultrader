import bcrypt from 'bcrypt';
import { User, IUser } from '../models/User';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Session data structure
 */
export interface SessionData {
  userId: mongoose.Types.ObjectId;
  email: string;
}

/**
 * Authentication Service
 * Handles user registration, login, password hashing, and session management
 */
export class AuthService {
  private static readonly BCRYPT_ROUNDS = 10;

  /**
   * Hash a password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password
   */
  public async hashPassword(password: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(password, AuthService.BCRYPT_ROUNDS);
      return hash;
    } catch (error) {
      logger.error('Error hashing password:', error);
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify a password against a hash
   * @param password - Plain text password
   * @param hash - Bcrypt hash to compare against
   * @returns True if password matches, false otherwise
   */
  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (error) {
      logger.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Register a new user
   * @param email - User email address
   * @param password - Plain text password
   * @returns Created user document
   * @throws Error if email already exists or validation fails
   */
  public async signup(email: string, password: string): Promise<IUser> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Validate password requirements
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Create new user
      const user = new User({
        email: email.toLowerCase(),
        passwordHash,
      });

      await user.save();

      logger.info('User created successfully', { userId: user._id, email: user.email });
      return user;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Signup error:', { message: error.message, email });
        throw error;
      }
      throw new Error('Signup failed');
    }
  }

  /**
   * Authenticate a user and create session data
   * @param email - User email address
   * @param password - Plain text password
   * @returns Session data with user information
   * @throws Error if credentials are invalid
   */
  public async login(email: string, password: string): Promise<SessionData> {
    try {
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      logger.info('User logged in successfully', { userId: user._id, email: user.email });

      // Return session data
      return {
        userId: user._id,
        email: user.email,
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Login error:', { message: error.message, email });
        throw error;
      }
      throw new Error('Login failed');
    }
  }

  /**
   * Validate a session and retrieve user data
   * @param userId - User ID from session
   * @returns User document or null if not found
   */
  public async validateSession(userId: mongoose.Types.ObjectId): Promise<IUser | null> {
    try {
      const user = await User.findById(userId);
      return user;
    } catch (error) {
      logger.error('Session validation error:', error);
      return null;
    }
  }

  /**
   * Logout user (session termination handled by express-session)
   * This method is a placeholder for any cleanup logic needed during logout
   * @param userId - User ID from session
   */
  public async logout(userId: mongoose.Types.ObjectId): Promise<void> {
    logger.info('User logged out', { userId });
    // Additional cleanup logic can be added here if needed
  }
}

export const authService = new AuthService();
