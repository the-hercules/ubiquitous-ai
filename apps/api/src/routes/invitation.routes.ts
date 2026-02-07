import { Router } from "express";
import { InvitationController } from "../controllers/invitation.controller";

const router = Router();
const controller = new InvitationController();

router.post("/", controller.create);
router.post("/accept", controller.accept);

export default router;
