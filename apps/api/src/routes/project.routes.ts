import { Router } from "express";
import { ProjectController } from "../controllers/project.controller";

const router = Router();
const projectController = new ProjectController();

// TODO: Implement project routes
// router.post("/", projectController.createProject);
// router.get("/", projectController.listProjects);
// router.get("/:id", projectController.getProject);
// router.patch("/:id", projectController.updateProject);
// router.delete("/:id", projectController.deleteProject);

export default router;
