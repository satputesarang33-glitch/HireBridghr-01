import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * Centralized Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Log detailed error internally
  logger.error(`${req.method} ${req.originalUrl} - ${message}`, err);

  // Prisma Error Handling
  if (err.code) {
    switch (err.code) {
      case 'P2002': {
        statusCode = 409;
        const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
        message = `Unique constraint violation: A record with this ${target} already exists.`;
        break;
      }
      case 'P2025': {
        statusCode = 404;
        message = 'The requested record could not be found or has been deleted.';
        break;
      }
      case 'P2003': {
        statusCode = 400;
        message = 'Foreign key constraint failed on related record.';
        break;
      }
      default:
        if (err.code.startsWith('P')) {
          statusCode = 400;
          message = 'Database operation failed.';
        }
    }
  }

  // Zod Validation Error handling
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.issues?.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })) || [];
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  // Safe response - prevent exposing stack traces or raw database exceptions in production
  const isProduction = env.NODE_ENV === 'production';
  const safeMessage = (isProduction && statusCode === 500)
    ? 'An unexpected error occurred. Please contact support.'
    : message;

  const response = {
    success: false,
    message: safeMessage,
    errors: errors.length > 0 ? errors : undefined,
    ...(!isProduction && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found Middleware for unknown routes
 */
export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};
