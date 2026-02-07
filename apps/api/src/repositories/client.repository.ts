import { PrismaClient, Client } from "@prisma/client";

const prisma = new PrismaClient();

export class ClientRepository {
  /**
   * Create a new client
   */
  async create(data: { name: string; tenant_id: string; contact_info?: any }): Promise<Client> {
    return prisma.client.create({
      data: {
        name: data.name,
        tenant_id: data.tenant_id,
        contact_info: data.contact_info || {},
      },
    });
  }

  /**
   * Find all clients for a tenant
   */
  async findByTenantId(tenantId: string): Promise<Client[]> {
    return prisma.client.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" },
    });
  }

  /**
   * Find a client by ID (with tenant check)
   */
  async findById(id: string, tenantId: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: {
        id,
        tenant_id: tenantId,
      },
    });
  }

  /**
   * Update a client
   */
  async update(
    id: string,
    tenantId: string,
    data: { name?: string; contact_info?: any }
  ): Promise<Client | null> {
    // First check if client exists and belongs to tenant
    const client = await this.findById(id, tenantId);
    if (!client) return null;

    return prisma.client.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a client
   */
  async delete(id: string, tenantId: string): Promise<boolean> {
    const client = await this.findById(id, tenantId);
    if (!client) return false;

    await prisma.client.delete({
      where: { id },
    });
    return true;
  }

  /**
   * Check if client exists and belongs to tenant
   */
  async exists(id: string, tenantId: string): Promise<boolean> {
    const count = await prisma.client.count({
      where: {
        id,
        tenant_id: tenantId,
      },
    });
    return count > 0;
  }
}
