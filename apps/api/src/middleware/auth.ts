import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';

/**
 * Clerk authentication middleware
 * Validates JWT tokens and makes auth available on request
 */
export const authMiddleware = clerkMiddleware();

/**
 * Require authentication middleware
 * Use this to protect routes that require a logged-in user
 */
export const requireAuthMiddleware = requireAuth();

/**
 * Extract user information from Clerk JWT and add to request
 */
export const extractUserMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth = getAuth(req);
    
    if (!auth || !auth.userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authentication token provided'
      });
    }

    // Add user information to request
    (req as any).userId = auth.userId;
    (req as any).clerkUser = auth;
    
    // Extract organization ID (tenant ID) from Clerk
    // In Clerk, organizations represent agencies (tenants)
    if (auth.orgId) {
      (req as any).tenantId = auth.orgId;
    }

    next();
  } catch (error) {
    console.error('Error extracting user from auth token:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authentication token'
    });
  }
};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      tenantId?: string;
      clerkUser?: any;
    }
  }
}
