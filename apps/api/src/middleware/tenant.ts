import { Request, Response, NextFunction } from 'express';

/**
 * Tenant isolation middleware
 * Ensures every request has a valid tenant context
 * Must be used AFTER auth middleware
 */
export const tenantMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if tenant ID was set by auth middleware
    if (!req.tenantId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'No tenant context found. User must belong to an organization.'
      });
    }

    // Log tenant context for debugging
    console.log(`[Tenant Middleware] User: ${req.userId}, Tenant: ${req.tenantId}`);

    next();
  } catch (error) {
    console.error('Error in tenant middleware:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to validate tenant context'
    });
  }
};

/**
 * Optional tenant middleware
 * Allows requests with or without tenant context
 * Useful for platform admin routes
 */
export const optionalTenantMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Just log but don't block
  if (req.tenantId) {
    console.log(`[Optional Tenant] User: ${req.userId}, Tenant: ${req.tenantId}`);
  } else {
    console.log(`[Optional Tenant] User: ${req.userId}, No tenant context`);
  }
  next();
};
