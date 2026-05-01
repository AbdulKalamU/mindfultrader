import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Error response interface
 */
interface ErrorResponse {
  error: string;
  message: string;
  fields?: Record<string, string>;
}

/**
 * Global error handling middleware
 * Formats error responses consistently and logs errors with context
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error with context
  logger.error('Request error:', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    userId: req.userId,
  });

  // Default error response
  const errorResponse: ErrorResponse = {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred. Please try again.',
  };

  let statusCode = 500;

  // Handle specific error types
  if (err.message.includes('Validation failed')) {
    statusCode = 400;
    errorResponse.error = 'Validation Error';
    errorResponse.message = err.message;
  } else if (err.message.includes('Invalid credentials')) {
    statusCode = 401;
    errorResponse.error = 'Authentication Error';
    errorResponse.message = err.message;
  } else if (err.message.includes('Email already registered')) {
    statusCode = 409;
    errorResponse.error = 'Conflict';
    errorResponse.message = err.message;
  } else if (err.message.includes('not found')) {
    statusCode = 404;
    errorResponse.error = 'Not Found';
    errorResponse.message = err.message;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 * Handles requests to non-existent endpoints
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.path} not found`,
  });
};
