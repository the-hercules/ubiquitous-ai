import { PrismaClient } from "@prisma/client";
import { AgencyRepository } from "../repositories/agency.repository";

const prisma = new PrismaClient();

export class AgencyService {
  private repo = new AgencyRepository();

  /**
   * Create new agency and set user as OWNER
   */
  async createAgency(name: string, slug: string, userId: string) {
    // Check slug is unique
    const existing = await this.repo.findBySlug(slug);
    if (existing) throw new Error("Agency slug already exists");

    // Create agency
    const agency = await this.repo.create({
      name,
      slug,
    });

    // Add user as owner
    await prisma.tenantMember.create({
      data: {
        tenant_id: agency.id,
        user_id: userId,
        role: "OWNER",
        status: "ACTIVE",
      },
    });

    // Update user with tenant and role
    await prisma.user.update({
      where: { id: userId },
      data: {
        tenant_id: agency.id,
        role: "OWNER",
      },
    });

    return agency;
  }

  /**
   * Get agency details
   */
  async getAgency(id: string) {
    const agency = await this.repo.findById(id);
    if (!agency) throw new Error("Agency not found");
    return agency;
  }
}
