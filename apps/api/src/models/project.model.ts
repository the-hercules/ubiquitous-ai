import { z } from "zod";

// Create Project DTO
export const CreateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  client_id: z.string().uuid("Invalid client ID"),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "ARCHIVED"]).default("PLANNING"),
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;

// Update Project DTO
export const UpdateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
});

export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;

// Project Response DTO
export interface ProjectResponseDto {
  id: string;
  name: string;
  client_id: string;
  tenant_id: string;
  start_date: Date | null;
  end_date: Date | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}
