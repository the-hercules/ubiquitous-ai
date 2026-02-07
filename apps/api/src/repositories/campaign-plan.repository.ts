import { PrismaClient, CampaignPlan } from "@prisma/client";

const prisma = new PrismaClient();

export class CampaignPlanRepository {
  /**
   * Create a new campaign plan
   */
  async create(data: {
    project_id: string;
    tenant_id: string;
    goals?: string[];
    themes?: string[];
    events?: string[];
    num_posts?: number;
    num_reels?: number;
    post_reel_split_percentage?: number;
    meeting_notes?: string;
  }): Promise<CampaignPlan> {
    return prisma.campaignPlan.create({
      data: {
        project_id: data.project_id,
        tenant_id: data.tenant_id,
        goals: data.goals || [],
        themes: data.themes || [],
        events: data.events || [],
        num_posts: data.num_posts || 0,
        num_reels: data.num_reels || 0,
        post_reel_split_percentage: data.post_reel_split_percentage,
        meeting_notes: data.meeting_notes,
      },
    });
  }

  /**
   * Find all campaign plans for a tenant
   */
  async findByTenantId(tenantId: string): Promise<CampaignPlan[]> {
    return prisma.campaignPlan.findMany({
      where: { tenant_id: tenantId },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }

  /**
   * Find all campaign plans for a specific project
   */
  async findByProjectId(projectId: string, tenantId: string): Promise<CampaignPlan[]> {
    return prisma.campaignPlan.findMany({
      where: {
        project_id: projectId,
        tenant_id: tenantId,
      },
      orderBy: { created_at: "desc" },
    });
  }

  /**
   * Find a campaign plan by ID (with tenant check)
   */
  async findById(id: string, tenantId: string): Promise<CampaignPlan | null> {
    return prisma.campaignPlan.findFirst({
      where: {
        id,
        tenant_id: tenantId,
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
        ideas: true,
      },
    });
  }

  /**
   * Update a campaign plan
   */
  async update(
    id: string,
    tenantId: string,
    data: {
      goals?: string[];
      themes?: string[];
      events?: string[];
      num_posts?: number;
      num_reels?: number;
      post_reel_split_percentage?: number;
      meeting_notes?: string;
    }
  ): Promise<CampaignPlan | null> {
    const plan = await this.findById(id, tenantId);
    if (!plan) return null;

    return prisma.campaignPlan.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a campaign plan
   */
  async delete(id: string, tenantId: string): Promise<boolean> {
    const plan = await this.findById(id, tenantId);
    if (!plan) return false;

    await prisma.campaignPlan.delete({
      where: { id },
    });
    return true;
  }
}
