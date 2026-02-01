import { Request, Response, NextFunction } from 'express';

/**
 * Error handler middleware
 * Centralized error handling for the API
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error Handler]', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.userId,
    tenantId: req.tenantId
  });

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: err.name || 'Error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response
) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
};
