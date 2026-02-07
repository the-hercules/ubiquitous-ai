import { ClientRepository } from "../repositories/client.repository";
import { CreateClientDto, UpdateClientDto, ClientResponseDto } from "../models/client.model";

export class ClientService {
  private clientRepo: ClientRepository;

  constructor() {
    this.clientRepo = new ClientRepository();
  }

  /**
   * Create a new client
   */
  async create(data: CreateClientDto, tenantId: string): Promise<ClientResponseDto> {
    const client = await this.clientRepo.create({
      name: data.name,
      tenant_id: tenantId,
      contact_info: data.contact_info,
    });

    return client as ClientResponseDto;
  }

  /**
   * Get all clients for a tenant
   */
  async getAll(tenantId: string): Promise<ClientResponseDto[]> {
    const clients = await this.clientRepo.findByTenantId(tenantId);
    return clients as ClientResponseDto[];
  }

  /**
   * Get a single client by ID
   */
  async getById(id: string, tenantId: string): Promise<ClientResponseDto | null> {
    const client = await this.clientRepo.findById(id, tenantId);
    if (!client) {
      return null;
    }
    return client as ClientResponseDto;
  }

  /**
   * Update a client
   */
  async update(
    id: string,
    data: UpdateClientDto,
    tenantId: string
  ): Promise<ClientResponseDto | null> {
    const client = await this.clientRepo.update(id, tenantId, data);
    if (!client) {
      return null;
    }
    return client as ClientResponseDto;
  }

  /**
   * Delete a client
   */
  async delete(id: string, tenantId: string): Promise<boolean> {
    return this.clientRepo.delete(id, tenantId);
  }
}
