import { Request, Response } from "express";
import { z } from "zod";
import { InvitationService } from "../services/invitation.service";

const CreateInviteSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["OWNER", "ADMIN", "TEAM", "CLIENT"]),
  scope: z.enum(["agency", "project"]),
  resource_id: z.string().uuid("Invalid resource ID"),
});

const AcceptInviteSchema = z.object({
  token: z.string().min(1, "Token required"),
});

export class InvitationController {
  private service = new InvitationService();

  /**
   * POST /api/invitations - Create invitation
   */
  create = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const payload = CreateInviteSchema.parse(req.body);
      const { invitation, token } = await this.service.createInvitation(
        payload.email,
        payload.role,
        payload.scope,
        payload.resource_id,
        user.id
      );

      return res.status(201).json({
        message: "Invitation created",
        invitation: { id: invitation.id, email: invitation.email, status: invitation.status },
        token, // For dev/testing
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: err.errors });
      }
      return res.status(400).json({ error: err.message || "Failed to create invitation" });
    }
  };

  /**
   * POST /api/invitations/accept - Accept invitation
   */
  accept = async (req: Request, res: Response) => {
    try {
      const auth = (req as any).clerkUser;
      const user = (req as any).user;

      if (!user || !auth) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userEmail = auth.email || auth.emailAddresses?.[0]?.emailAddress;
      if (!userEmail) {
        return res.status(400).json({ error: "Email not found in auth" });
      }

      const { token } = AcceptInviteSchema.parse(req.body);
      const result = await this.service.acceptInvitation(token, userEmail, user.clerk_user_id);

      return res.json({ ok: true, message: "Invitation accepted" });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: err.errors });
      }
      return res.status(400).json({ error: err.message || "Failed to accept invitation" });
    }
  };
}
