import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { InvitationRepository } from "../repositories/invitation.repository";

const prisma = new PrismaClient();
const INVITE_SECRET = process.env.INVITE_TOKEN_SECRET || "dev-secret-change-in-prod";

export class InvitationService {
  private repo = new InvitationRepository();

  /**
   * Create and send invitation
   */
  async createInvitation(
    email: string,
    role: string,
    scope: string,
    resourceId: string,
    invitedByUserId: string
  ) {
    // Verify inviter has permission
    const inviter = await prisma.user.findUnique({
      where: { id: invitedByUserId },
    });
    if (!inviter) throw new Error("Inviter not found");
    if (inviter.role !== "OWNER" && inviter.role !== "ADMIN") {
      throw new Error("Only OWNER/ADMIN can invite");
    }

    const { invitation, plainToken } = await this.repo.create({
      email,
      role,
      scope,
      resource_id: resourceId,
      invited_by: invitedByUserId,
    });

    // TODO: Send email with token link
    // For dev: return token
    return { invitation, token: plainToken };
  }

  /**
   * Accept invitation by token
   */
  async acceptInvitation(plainToken: string, userEmail: string, clerkUserId: string) {
    // Hash the token and look up
    const tokenHash = crypto
      .createHmac("sha256", INVITE_SECRET)
      .update(plainToken)
      .digest("hex");

    const invitation = await this.repo.findByTokenHash(tokenHash);
    if (!invitation) throw new Error("Invalid invitation token");
    if (invitation.status !== "PENDING") throw new Error("Invitation not pending");
    if (invitation.expires_at < new Date()) throw new Error("Invitation expired");
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new Error("Email mismatch");
    }

    // Find or create local user
    let user = await prisma.user.findUnique({
      where: { clerk_user_id: clerkUserId },
    });
    if (!user) {
      user = await prisma.user.create({
        data: { clerk_user_id: clerkUserId, email: userEmail },
      });
    }

    // Handle based on scope
    if (invitation.scope === "agency") {
      // Add to tenant as member
      await prisma.tenantMember.create({
        data: {
          tenant_id: invitation.resource_id,
          user_id: user.id,
          role: invitation.role as any,
          status: "ACTIVE",
          invited_by: invitation.invited_by,
        },
      });

      // Also set as primary tenant for user
      await prisma.user.update({
        where: { id: user.id },
        data: { tenant_id: invitation.resource_id, role: invitation.role as any },
      });
    } else if (invitation.scope === "project") {
      // Add to project membership
      const project = await prisma.project.findUnique({
        where: { id: invitation.resource_id },
      });
      if (!project) throw new Error("Project not found");

      await prisma.projectMembership.create({
        data: {
          project_id: invitation.resource_id,
          user_id: user.id,
          role: invitation.role as any,
          status: "ACTIVE",
          invited_by: invitation.invited_by,
          invited_at: new Date(),
        },
      });

      // Set tenant if not already set
      if (!user.tenant_id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { tenant_id: project.tenant_id, role: invitation.role as any },
        });
      }
    }

    // Mark invitation as accepted
    await this.repo.updateStatus(invitation.id, "ACCEPTED");

    return { ok: true, user };
  }
}
