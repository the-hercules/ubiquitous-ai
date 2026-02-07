import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const INVITE_SECRET = process.env.INVITE_TOKEN_SECRET || "dev-secret-change-in-prod";
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export class InvitationRepository {
  /**
   * Create invitation with hashed token
   */
  async create(data: {
    email: string;
    role: string;
    scope: string;
    resource_id: string;
    invited_by: string;
  }) {
    const plainToken = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto
      .createHmac("sha256", INVITE_SECRET)
      .update(plainToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

    const invitation = await prisma.invitation.create({
      data: {
        email: data.email.toLowerCase(),
        token_hash: tokenHash,
        role: data.role as any,
        scope: data.scope,
        resource_id: data.resource_id,
        invited_by: data.invited_by,
        status: "PENDING",
        expires_at: expiresAt,
      },
    });

    return { invitation, plainToken };
  }

  /**
   * Find invitation by hashed token
   */
  async findByTokenHash(tokenHash: string) {
    return prisma.invitation.findUnique({
      where: { token_hash: tokenHash },
    });
  }

  /**
   * Update invitation status
   */
  async updateStatus(id: string, status: string) {
    return prisma.invitation.update({
      where: { id },
      data: { status, updated_at: new Date() },
    });
  }
}
