import { Request, Response } from "express";
import { ClientService } from "../services/client.service";
import { CreateClientSchema, UpdateClientSchema } from "../models/client.model";
import { ZodError } from "zod";

export class ClientController {
  private clientService: ClientService;

  constructor() {
    this.clientService = new ClientService();
  }

  /**
   * Create a new client
   * POST /api/clients
   */
  create = async (req: Request, res: Response) => {
    try {
      const validated = CreateClientSchema.parse(req.body);
      const client = await this.clientService.create(validated, req.tenantId!);
      return res.status(201).json(client);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to create client" });
    }
  };

  /**
   * Get all clients for the tenant
   * GET /api/clients
   */
  getAll = async (req: Request, res: Response) => {
    try {
      const clients = await this.clientService.getAll(req.tenantId!);
      return res.json(clients);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch clients" });
    }
  };

  /**
   * Get a single client by ID
   * GET /api/clients/:id
   */
  getById = async (req: Request, res: Response) => {
    try {
      const client = await this.clientService.getById(req.params.id, req.tenantId!);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      return res.json(client);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch client" });
    }
  };

  /**
   * Update a client
   * PUT /api/clients/:id
   */
  update = async (req: Request, res: Response) => {
    try {
      const validated = UpdateClientSchema.parse(req.body);
      const client = await this.clientService.update(req.params.id, validated, req.tenantId!);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      return res.json(client);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to update client" });
    }
  };

  /**
   * Delete a client
   * DELETE /api/clients/:id
   */
  delete = async (req: Request, res: Response) => {
    try {
      const success = await this.clientService.delete(req.params.id, req.tenantId!);
      if (!success) {
        return res.status(404).json({ error: "Client not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete client" });
    }
  };
}
