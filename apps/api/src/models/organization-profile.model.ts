import { z } from "zod";

// Create/Update Organization Profile DTO
export const UpsertOrganizationProfileSchema = z.object({
  client_id: z.string().uuid("Invalid client ID"),
  brand_tone: z.string().optional(),
  industry: z.string().optional(),
  target_audience: z.string().optional(),
  voice_attributes: z.record(z.any()).optional(),
});

export type UpsertOrganizationProfileDto = z.infer<typeof UpsertOrganizationProfileSchema>;

// Organization Profile Response DTO
export interface OrganizationProfileResponseDto {
  id: string;
  client_id: string;
  tenant_id: string;
  brand_tone: string | null;
  industry: string | null;
  target_audience: string | null;
  voice_attributes: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
}
