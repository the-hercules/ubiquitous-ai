import { Router } from "express";
import { CampaignPlanController } from "../controllers/campaign-plan.controller";

const router = Router();
const campaignPlanController = new CampaignPlanController();

// TODO: Implement campaign plan routes
// router.post("/", campaignPlanController.createPlan);
// router.get("/", campaignPlanController.listPlans);
// router.get("/:id", campaignPlanController.getPlan);
// router.patch("/:id", campaignPlanController.updatePlan);
// router.delete("/:id", campaignPlanController.deletePlan);

export default router;
