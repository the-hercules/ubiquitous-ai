import express, { type Express, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { authMiddleware, extractUserMiddleware } from "./middleware/auth";
import apiRoutes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error";

// Load environment variables
dotenv.config();

export const createServer = (): Express => {
  const app = express();
  
  // Basic middleware
  app.disable("x-powered-by");
  app.use(morgan("dev"));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());

  // Health check endpoint (no auth required)
  app.get("/health", (_req: Request, res: Response) => {
    return res.json({
      status: "healthy",
      service: "api",
      timestamp: new Date().toISOString()
    });
  });

  // Root endpoint
  app.get("/", (_req: Request, res: Response) => {
    return res.json({
      message: "Social Media Agency SaaS API",
      version: "1.0.0",
      status: "running"
    });
  });

  // Legacy routes (keep for compatibility)
  app.get("/status", (_, res) => {
    return res.json({ ok: true });
  });

  app.get("/message/:name", (req, res) => {
    return res.json({ message: `hello ${req.params.name}` });
  });

  // Apply Clerk authentication middleware to all /api routes
  app.use("/api", authMiddleware);
  app.use("/api", extractUserMiddleware);

  // Mount API routes (protected by Clerk middleware above)
  app.use('/api', apiRoutes);

  // Example protected route
  app.get('/api/me', (req: Request, res: Response) => {
    return res.json({
      userId: req.userId,
      tenantId: req.tenantId,
      user: {
        id: (req as any).user?.id,
        email: (req as any).user?.email,
        role: (req as any).user?.role,
        tenant_id: (req as any).user?.tenant_id,
      },
      message: 'Authenticated user information'
    });
  });

  // Error handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
