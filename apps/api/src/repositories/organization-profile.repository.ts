import { PrismaClient, OrganizationProfile } from "@prisma/client";

const prisma = new PrismaClient();

export class OrganizationProfileRepository {
  /**
   * Create or update organization profile (upsert)
   */
  async upsert(data: {
    client_id: string;
    tenant_id: string;
    brand_tone?: string;
    industry?: string;
    target_audience?: string;
    voice_attributes?: any;
  }): Promise<OrganizationProfile> {
    return prisma.organizationProfile.upsert({
      where: { client_id: data.client_id },
      create: {
        client_id: data.client_id,
        tenant_id: data.tenant_id,
        brand_tone: data.brand_tone,
        industry: data.industry,
        target_audience: data.target_audience,
        voice_attributes: data.voice_attributes || {},
      },
      update: {
        brand_tone: data.brand_tone,
        industry: data.industry,
        target_audience: data.target_audience,
        voice_attributes: data.voice_attributes,
      },
    });
  }

  /**
   * Find organization profile by client ID
   */
  async findByClientId(clientId: string, tenantId: string): Promise<OrganizationProfile | null> {
    return prisma.organizationProfile.findFirst({
      where: {
        client_id: clientId,
        tenant_id: tenantId,
      },
      include: {
        client: true,
      },
    });
  }

  /**
   * Delete organization profile
   */
  async delete(clientId: string, tenantId: string): Promise<boolean> {
    const profile = await this.findByClientId(clientId, tenantId);
    if (!profile) return false;

    await prisma.organizationProfile.delete({
      where: { client_id: clientId },
    });
    return true;
  }
}
