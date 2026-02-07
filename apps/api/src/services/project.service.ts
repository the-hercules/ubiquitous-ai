import { ProjectRepository } from "../repositories/project.repository";
import { ClientRepository } from "../repositories/client.repository";
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto } from "../models/project.model";

export class ProjectService {
  private projectRepo: ProjectRepository;
  private clientRepo: ClientRepository;

  constructor() {
    this.projectRepo = new ProjectRepository();
    this.clientRepo = new ClientRepository();
  }

  /**
   * Create a new project
   */
  async create(data: CreateProjectDto, tenantId: string): Promise<ProjectResponseDto> {
    // Verify client exists and belongs to tenant
    const clientExists = await this.clientRepo.exists(data.client_id, tenantId);
    if (!clientExists) {
      throw new Error("Client not found or access denied");
    }

    const project = await this.projectRepo.create({
      name: data.name,
      client_id: data.client_id,
      tenant_id: tenantId,
      start_date: data.start_date ? new Date(data.start_date) : undefined,
      end_date: data.end_date ? new Date(data.end_date) : undefined,
      status: data.status,
    });

    return project as ProjectResponseDto;
  }

  /**
   * Get all projects for a tenant
   */
  async getAll(tenantId: string): Promise<ProjectResponseDto[]> {
    const projects = await this.projectRepo.findByTenantId(tenantId);
    return projects as ProjectResponseDto[];
  }

  /**
   * Get all projects for a specific client
   */
  async getByClientId(clientId: string, tenantId: string): Promise<ProjectResponseDto[]> {
    const projects = await this.projectRepo.findByClientId(clientId, tenantId);
    return projects as ProjectResponseDto[];
  }

  /**
   * Get a single project by ID
   */
  async getById(id: string, tenantId: string): Promise<ProjectResponseDto | null> {
    const project = await this.projectRepo.findById(id, tenantId);
    if (!project) {
      return null;
    }
    return project as ProjectResponseDto;
  }

  /**
   * Update a project
   */
  async update(
    id: string,
    data: UpdateProjectDto,
    tenantId: string
  ): Promise<ProjectResponseDto | null> {
    const updateData = {
      name: data.name,
      start_date: data.start_date ? new Date(data.start_date) : undefined,
      end_date: data.end_date ? new Date(data.end_date) : undefined,
      status: data.status as any,
    };

    const project = await this.projectRepo.update(id, tenantId, updateData);
    if (!project) {
      return null;
    }
    return project as ProjectResponseDto;
  }

  /**
   * Delete a project
   */
  async delete(id: string, tenantId: string): Promise<boolean> {
    return this.projectRepo.delete(id, tenantId);
  }
}
