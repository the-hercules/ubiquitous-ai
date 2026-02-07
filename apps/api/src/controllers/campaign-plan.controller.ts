import { Request, Response } from "express";
import { CampaignPlanService } from "../services/campaign-plan.service";
import { CreateCampaignPlanSchema, UpdateCampaignPlanSchema } from "../models/campaign-plan.model";
import { ZodError } from "zod";

export class CampaignPlanController {
  private campaignPlanService: CampaignPlanService;

  constructor() {
    this.campaignPlanService = new CampaignPlanService();
  }

  /**
   * Create a new campaign plan
   * POST /api/campaign-plans
   */
  create = async (req: Request, res: Response) => {
    try {
      const validated = CreateCampaignPlanSchema.parse(req.body);
      const plan = await this.campaignPlanService.create(validated, req.tenantId!);
      return res.status(201).json(plan);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to create campaign plan" });
    }
  };

  /**
   * Get all campaign plans for the tenant
   * GET /api/campaign-plans
   */
  getAll = async (req: Request, res: Response) => {
    try {
      const projectId = req.query.project_id as string | undefined;
      
      if (projectId) {
        const plans = await this.campaignPlanService.getByProjectId(projectId, req.tenantId!);
        return res.json(plans);
      }

      const plans = await this.campaignPlanService.getAll(req.tenantId!);
      return res.json(plans);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch campaign plans" });
    }
  };

  /**
   * Get a single campaign plan by ID
   * GET /api/campaign-plans/:id
   */
  getById = async (req: Request, res: Response) => {
    try {
      const plan = await this.campaignPlanService.getById(req.params.id, req.tenantId!);
      if (!plan) {
        return res.status(404).json({ error: "Campaign plan not found" });
      }
      return res.json(plan);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch campaign plan" });
    }
  };

  /**
   * Update a campaign plan
   * PUT /api/campaign-plans/:id
   */
  update = async (req: Request, res: Response) => {
    try {
      const validated = UpdateCampaignPlanSchema.parse(req.body);
      const plan = await this.campaignPlanService.update(req.params.id, validated, req.tenantId!);
      if (!plan) {
        return res.status(404).json({ error: "Campaign plan not found" });
      }
      return res.json(plan);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to update campaign plan" });
    }
  };

  /**
   * Delete a campaign plan
   * DELETE /api/campaign-plans/:id
   */
  delete = async (req: Request, res: Response) => {
    try {
      const success = await this.campaignPlanService.delete(req.params.id, req.tenantId!);
      if (!success) {
        return res.status(404).json({ error: "Campaign plan not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete campaign plan" });
    }
  };
}
