import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AgencyRepository {
  /**
   * Create new agency (tenant)
   */
  async create(data: { name: string; slug: string; settings?: any }) {
    return prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        settings: data.settings || {},
      },
    });
  }

  /**
   * Find by slug
   */
  async findBySlug(slug: string) {
    return prisma.tenant.findUnique({ where: { slug } });
  }

  /**
   * Find by ID
   */
  async findById(id: string) {
    return prisma.tenant.findUnique({ where: { id } });
  }
}
