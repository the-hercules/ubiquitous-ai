import { Router } from "express";
import agencyRoutes from "./agency.routes";
import clientRoutes from "./client.routes";
import projectRoutes from "./project.routes";
import organizationProfileRoutes from "./organization-profile.routes";
import campaignPlanRoutes from "./campaign-plan.routes";
import invitationRoutes from "./invitation.routes";

const router = Router();

// Mount all routes
router.use("/agencies", agencyRoutes);
router.use("/clients", clientRoutes);
router.use("/projects", projectRoutes);
router.use("/organization-profiles", organizationProfileRoutes);
router.use("/campaign-plans", campaignPlanRoutes);
router.use("/invitations", invitationRoutes);

export default router;
