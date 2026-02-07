import { Router } from "express";
import { ClientController } from "../controllers/client.controller";

const router = Router();
const clientController = new ClientController();

// TODO: Implement client routes
// router.post("/", clientController.createClient);
// router.get("/", clientController.listClients);
// router.get("/:id", clientController.getClient);
// router.patch("/:id", clientController.updateClient);
// router.delete("/:id", clientController.deleteClient);

export default router;
