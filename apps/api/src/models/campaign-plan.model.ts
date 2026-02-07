import { z } from "zod";

// Create Campaign Plan DTO
export const CreateCampaignPlanSchema = z.object({
  project_id: z.string().uuid("Invalid project ID"),
  goals: z.array(z.string()).optional(),
  themes: z.array(z.string()).optional(),
  events: z.array(z.string()).optional(),
  num_posts: z.number().int().min(0).default(0),
  num_reels: z.number().int().min(0).default(0),
  post_reel_split_percentage: z.number().min(0).max(100).optional(),
  meeting_notes: z.string().optional(),
});

export type CreateCampaignPlanDto = z.infer<typeof CreateCampaignPlanSchema>;

// Update Campaign Plan DTO
export const UpdateCampaignPlanSchema = z.object({
  goals: z.array(z.string()).optional(),
  themes: z.array(z.string()).optional(),
  events: z.array(z.string()).optional(),
  num_posts: z.number().int().min(0).optional(),
  num_reels: z.number().int().min(0).optional(),
  post_reel_split_percentage: z.number().min(0).max(100).optional(),
  meeting_notes: z.string().optional(),
});

export type UpdateCampaignPlanDto = z.infer<typeof UpdateCampaignPlanSchema>;

// Campaign Plan Response DTO
export interface CampaignPlanResponseDto {
  id: string;
  project_id: string;
  tenant_id: string;
  goals: any[];
  themes: any[];
  events: any[];
  num_posts: number;
  num_reels: number;
  post_reel_split_percentage: number | null;
  meeting_notes: string | null;
  created_at: Date;
  updated_at: Date;
}
