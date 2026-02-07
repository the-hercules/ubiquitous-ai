import { Request, Response } from "express";
import { OrganizationProfileService } from "../services/organization-profile.service";
import { UpsertOrganizationProfileSchema } from "../models/organization-profile.model";
import { ZodError } from "zod";

export class OrganizationProfileController {
  private orgProfileService: OrganizationProfileService;

  constructor() {
    this.orgProfileService = new OrganizationProfileService();
  }

  /**
   * Create or update organization profile
   * POST /api/organization-profiles
   */
  upsert = async (req: Request, res: Response) => {
    try {
      const validated = UpsertOrganizationProfileSchema.parse(req.body);
      const profile = await this.orgProfileService.upsert(validated, req.tenantId!);
      return res.status(200).json(profile);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to save organization profile" });
    }
  };

  /**
   * Get organization profile by client ID
   * GET /api/organization-profiles/client/:clientId
   */
  getByClientId = async (req: Request, res: Response) => {
    try {
      const profile = await this.orgProfileService.getByClientId(
        req.params.clientId,
        req.tenantId!
      );
      if (!profile) {
        return res.status(404).json({ error: "Organization profile not found" });
      }
      return res.json(profile);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch organization profile" });
    }
  };

  /**
   * Delete organization profile
   * DELETE /api/organization-profiles/client/:clientId
   */
  delete = async (req: Request, res: Response) => {
    try {
      const success = await this.orgProfileService.delete(req.params.clientId, req.tenantId!);
      if (!success) {
        return res.status(404).json({ error: "Organization profile not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete organization profile" });
    }
  };
}
