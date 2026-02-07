import { Request, Response } from "express";
import { ProjectService } from "../services/project.service";
import { CreateProjectSchema, UpdateProjectSchema } from "../models/project.model";
import { ZodError } from "zod";

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  /**
   * Create a new project
   * POST /api/projects
   */
  create = async (req: Request, res: Response) => {
    try {
      const validated = CreateProjectSchema.parse(req.body);
      const project = await this.projectService.create(validated, req.tenantId!);
      return res.status(201).json(project);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to create project" });
    }
  };

  /**
   * Get all projects for the tenant
   * GET /api/projects
   */
  getAll = async (req: Request, res: Response) => {
    try {
      const clientId = req.query.client_id as string | undefined;
      
      if (clientId) {
        const projects = await this.projectService.getByClientId(clientId, req.tenantId!);
        return res.json(projects);
      }

      const projects = await this.projectService.getAll(req.tenantId!);
      return res.json(projects);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch projects" });
    }
  };

  /**
   * Get a single project by ID
   * GET /api/projects/:id
   */
  getById = async (req: Request, res: Response) => {
    try {
      const project = await this.projectService.getById(req.params.id, req.tenantId!);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      return res.json(project);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch project" });
    }
  };

  /**
   * Update a project
   * PUT /api/projects/:id
   */
  update = async (req: Request, res: Response) => {
    try {
      const validated = UpdateProjectSchema.parse(req.body);
      const project = await this.projectService.update(req.params.id, validated, req.tenantId!);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      return res.json(project);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to update project" });
    }
  };

  /**
   * Delete a project
   * DELETE /api/projects/:id
   */
  delete = async (req: Request, res: Response) => {
    try {
      const success = await this.projectService.delete(req.params.id, req.tenantId!);
      if (!success) {
        return res.status(404).json({ error: "Project not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete project" });
    }
  };
}
