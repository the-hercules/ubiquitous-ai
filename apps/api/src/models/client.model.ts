import { z } from "zod";

// Create Client DTO
export const CreateClientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  contact_info: z.record(z.any()).optional(),
});

export type CreateClientDto = z.infer<typeof CreateClientSchema>;

// Update Client DTO
export const UpdateClientSchema = z.object({
  name: z.string().min(1).optional(),
  contact_info: z.record(z.any()).optional(),
});

export type UpdateClientDto = z.infer<typeof UpdateClientSchema>;

// Client Response DTO
export interface ClientResponseDto {
  id: string;
  name: string;
  tenant_id: string;
  contact_info: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
}
