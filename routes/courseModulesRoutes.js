import express from "express";
import {
  getCourseModules,
  createCourseModule,
  updateCourseModule,
  deleteCourseModule,
  toggleCourseModuleStatus,
} from "../controllers/courseModulesController.js";

const router = express.Router();

router.get("/", getCourseModules);
router.post("/", createCourseModule);
router.put("/:id", updateCourseModule);
router.put("/:id/status", toggleCourseModuleStatus);
router.delete("/:id", deleteCourseModule);

export default router;
