import { OrganizationProfileRepository } from "../repositories/organization-profile.repository";
import { ClientRepository } from "../repositories/client.repository";
import {
  UpsertOrganizationProfileDto,
  OrganizationProfileResponseDto,
} from "../models/organization-profile.model";

export class OrganizationProfileService {
  private orgProfileRepo: OrganizationProfileRepository;
  private clientRepo: ClientRepository;

  constructor() {
    this.orgProfileRepo = new OrganizationProfileRepository();
    this.clientRepo = new ClientRepository();
  }

  /**
   * Create or update organization profile
   */
  async upsert(
    data: UpsertOrganizationProfileDto,
    tenantId: string
  ): Promise<OrganizationProfileResponseDto> {
    // Verify client exists and belongs to tenant
    const clientExists = await this.clientRepo.exists(data.client_id, tenantId);
    if (!clientExists) {
      throw new Error("Client not found or access denied");
    }

    const profile = await this.orgProfileRepo.upsert({
      client_id: data.client_id,
      tenant_id: tenantId,
      brand_tone: data.brand_tone,
      industry: data.industry,
      target_audience: data.target_audience,
      voice_attributes: data.voice_attributes,
    });

    return profile as OrganizationProfileResponseDto;
  }

  /**
   * Get organization profile by client ID
   */
  async getByClientId(
    clientId: string,
    tenantId: string
  ): Promise<OrganizationProfileResponseDto | null> {
    const profile = await this.orgProfileRepo.findByClientId(clientId, tenantId);
    if (!profile) {
      return null;
    }
    return profile as OrganizationProfileResponseDto;
  }

  /**
   * Delete organization profile
   */
  async delete(clientId: string, tenantId: string): Promise<boolean> {
    return this.orgProfileRepo.delete(clientId, tenantId);
  }
}
