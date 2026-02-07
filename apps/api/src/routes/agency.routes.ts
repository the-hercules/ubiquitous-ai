import { Router } from "express";
import { AgencyController } from "../controllers/agency.controller";

const router = Router();
const controller = new AgencyController();

router.post("/", controller.create);
router.get("/:id", controller.getDetails);

export default router;
