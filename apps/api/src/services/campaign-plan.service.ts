import { CampaignPlanRepository } from "../repositories/campaign-plan.repository";
import { ProjectRepository } from "../repositories/project.repository";
import {
  CreateCampaignPlanDto,
  UpdateCampaignPlanDto,
  CampaignPlanResponseDto,
} from "../models/campaign-plan.model";

export class CampaignPlanService {
  private campaignPlanRepo: CampaignPlanRepository;
  private projectRepo: ProjectRepository;

  constructor() {
    this.campaignPlanRepo = new CampaignPlanRepository();
    this.projectRepo = new ProjectRepository();
  }

  /**
   * Create a new campaign plan
   */
  async create(data: CreateCampaignPlanDto, tenantId: string): Promise<CampaignPlanResponseDto> {
    // Verify project exists and belongs to tenant
    const projectExists = await this.projectRepo.exists(data.project_id, tenantId);
    if (!projectExists) {
      throw new Error("Project not found or access denied");
    }

    const plan = await this.campaignPlanRepo.create({
      project_id: data.project_id,
      tenant_id: tenantId,
      goals: data.goals,
      themes: data.themes,
      events: data.events,
      num_posts: data.num_posts,
      num_reels: data.num_reels,
      post_reel_split_percentage: data.post_reel_split_percentage,
      meeting_notes: data.meeting_notes,
    });

    return plan as CampaignPlanResponseDto;
  }

  /**
   * Get all campaign plans for a tenant
   */
  async getAll(tenantId: string): Promise<CampaignPlanResponseDto[]> {
    const plans = await this.campaignPlanRepo.findByTenantId(tenantId);
    return plans as CampaignPlanResponseDto[];
  }

  /**
   * Get all campaign plans for a specific project
   */
  async getByProjectId(projectId: string, tenantId: string): Promise<CampaignPlanResponseDto[]> {
    const plans = await this.campaignPlanRepo.findByProjectId(projectId, tenantId);
    return plans as CampaignPlanResponseDto[];
  }

  /**
   * Get a single campaign plan by ID
   */
  async getById(id: string, tenantId: string): Promise<CampaignPlanResponseDto | null> {
    const plan = await this.campaignPlanRepo.findById(id, tenantId);
    if (!plan) {
      return null;
    }
    return plan as CampaignPlanResponseDto;
  }

  /**
   * Update a campaign plan
   */
  async update(
    id: string,
    data: UpdateCampaignPlanDto,
    tenantId: string
  ): Promise<CampaignPlanResponseDto | null> {
    const plan = await this.campaignPlanRepo.update(id, tenantId, data);
    if (!plan) {
      return null;
    }
    return plan as CampaignPlanResponseDto;
  }

  /**
   * Delete a campaign plan
   */
  async delete(id: string, tenantId: string): Promise<boolean> {
    return this.campaignPlanRepo.delete(id, tenantId);
  }
}
