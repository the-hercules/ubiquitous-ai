import { clerkMiddleware, getAuth, requireAuth } from "@clerk/express";
import { PrismaClient } from "@prisma/client";
import type { RequestHandler } from "express";
import { NextFunction, Request, Response } from "express";

const prisma = new PrismaClient();

/**
 * Clerk authentication middleware
 * Validates JWT tokens and makes auth available on request
 */
export const authMiddleware: RequestHandler = clerkMiddleware();

/**
 * Require authentication middleware
 * Use this to protect routes that require a logged-in user
 */
export const requireAuthMiddleware: RequestHandler = requireAuth();

/**
 * Extract user information from Clerk JWT, upsert local user, and add to request
 */
export const extractUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = getAuth(req);

    if (!auth || !auth.userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No valid authentication token provided",
      });
    }

    // Add user information to request
    (req as any).userId = auth.userId;
    (req as any).clerkUser = auth;

    // Extract organization ID (tenant ID) from Clerk
    if ((auth as any).orgId) {
      (req as any).tenantId = (auth as any).orgId;
    }

    // Upsert local user record (create on first login)
    const email = auth?.sessionClaims?.email;

    if (!email) {
      return res.status(400).json({ error: "Email not found in Clerk auth" });
    }

    const user = await prisma.user.upsert({
      where: { clerk_user_id: auth.userId },
      update: { email },
      create: {
        clerk_user_id: auth.userId,
        email: email.toLowerCase(),
      },
    });

    (req as any).user = user;

    next();
  } catch (error) {
    console.error("Error extracting user from auth token:", error);
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid authentication token",
    });
  }
};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      tenantId?: string;
      clerkUser?: any;
      user?: any;
    }
  }
}
