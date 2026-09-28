import { ApiError } from '../utils/apiError.js';

/**
 * Zod Request Validation Middleware
 * Validates req.body, req.query, or req.params against Zod schemas
 * @param {{ body?: import('zod').ZodSchema, query?: import('zod').ZodSchema, params?: import('zod').ZodSchema }} schemas
 */
export const validate = (schemas) => {
  return (req, res, next) => {
    try {
      const validationErrors = [];

      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          result.error.issues.forEach((issue) => {
            validationErrors.push({
              source: 'body',
              field: issue.path.join('.'),
              message: issue.message,
            });
          });
        } else {
          req.body = result.data;
        }
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          result.error.issues.forEach((issue) => {
            validationErrors.push({
              source: 'query',
              field: issue.path.join('.'),
              message: issue.message,
            });
          });
        } else {
          req.query = result.data;
        }
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          result.error.issues.forEach((issue) => {
            validationErrors.push({
              source: 'params',
              field: issue.path.join('.'),
              message: issue.message,
            });
          });
        } else {
          req.params = result.data;
        }
      }

      if (validationErrors.length > 0) {
        throw ApiError.badRequest('Validation failed', validationErrors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
