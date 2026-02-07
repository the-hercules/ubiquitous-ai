import { PrismaClient, Project, ProjectStatus } from "@prisma/client";

const prisma = new PrismaClient();

export class ProjectRepository {
  /**
   * Create a new project
   */
  async create(data: {
    name: string;
    client_id: string;
    tenant_id: string;
    start_date?: Date;
    end_date?: Date;
    status?: ProjectStatus;
  }): Promise<Project> {
    return prisma.project.create({
      data: {
        name: data.name,
        client_id: data.client_id,
        tenant_id: data.tenant_id,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status || "PLANNING",
      },
    });
  }

  /**
   * Find all projects for a tenant
   */
  async findByTenantId(tenantId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { tenant_id: tenantId },
      include: {
        client: true,
      },
      orderBy: { created_at: "desc" },
    });
  }

  /**
   * Find all projects for a specific client
   */
  async findByClientId(clientId: string, tenantId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: {
        client_id: clientId,
        tenant_id: tenantId,
      },
      orderBy: { created_at: "desc" },
    });
  }

  /**
   * Find a project by ID (with tenant check)
   */
  async findById(id: string, tenantId: string): Promise<Project | null> {
    return prisma.project.findFirst({
      where: {
        id,
        tenant_id: tenantId,
      },
      include: {
        client: true,
        campaign_plans: true,
      },
    });
  }

  /**
   * Update a project
   */
  async update(
    id: string,
    tenantId: string,
    data: {
      name?: string;
      start_date?: Date;
      end_date?: Date;
      status?: ProjectStatus;
    }
  ): Promise<Project | null> {
    const project = await this.findById(id, tenantId);
    if (!project) return null;

    return prisma.project.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a project
   */
  async delete(id: string, tenantId: string): Promise<boolean> {
    const project = await this.findById(id, tenantId);
    if (!project) return false;

    await prisma.project.delete({
      where: { id },
    });
    return true;
  }

  /**
   * Check if project exists and belongs to tenant
   */
  async exists(id: string, tenantId: string): Promise<boolean> {
    const count = await prisma.project.count({
      where: {
        id,
        tenant_id: tenantId,
      },
    });
    return count > 0;
  }
}
