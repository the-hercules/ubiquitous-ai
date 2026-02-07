import { Router } from "express";
import { OrganizationProfileController } from "../controllers/organization-profile.controller";

const router = Router();
const orgProfileController = new OrganizationProfileController();

// TODO: Implement organization profile routes
// router.post("/", orgProfileController.createProfile);
// router.get("/", orgProfileController.listProfiles);
// router.get("/:id", orgProfileController.getProfile);
// router.patch("/:id", orgProfileController.updateProfile);
// router.delete("/:id", orgProfileController.deleteProfile);

export default router;
