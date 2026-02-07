import { Request, Response } from "express";
import { z } from "zod";
import { AgencyService } from "../services/agency.service";

const CreateAgencySchema = z.object({
  name: z.string().min(1, "Agency name required").max(255),
  slug: z.string().min(1, "Slug required").max(100).regex(/^[a-z0-9-]+$/, "Invalid slug format"),
});

export class AgencyController {
  private service = new AgencyService();

  /**
   * POST /api/agencies - Create new agency
   */
  create = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      // Only new users (no tenant) can create agency
      if (user.tenant_id) {
        return res.status(400).json({ error: "User already belongs to an agency" });
      }

      const { name, slug } = CreateAgencySchema.parse(req.body);
      const agency = await this.service.createAgency(name, slug, user.id);

      return res.status(201).json({
        message: "Agency created successfully",
        agency: {
          id: agency.id,
          name: agency.name,
          slug: agency.slug,
        },
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: err.errors });
      }
      return res.status(400).json({ error: err.message || "Failed to create agency" });
    }
  };

  /**
   * GET /api/agencies/:id - Get agency details
   */
  getDetails = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user || !user.tenant_id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const agency = await this.service.getAgency(req.params.id);
      return res.json(agency);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };
}
