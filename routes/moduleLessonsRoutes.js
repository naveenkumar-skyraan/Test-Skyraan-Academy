import express from "express";
import {
  getModuleLessons,
  createModuleLesson,
  updateModuleLesson,
  deleteModuleLesson,
  toggleModuleLessonStatus,
} from "../controllers/moduleLessonsController.js";

const router = express.Router();

router.get("/", getModuleLessons);
router.post("/", createModuleLesson);
router.put("/:id", updateModuleLesson);
router.put("/:id/status", toggleModuleLessonStatus);
router.delete("/:id", deleteModuleLesson);

export default router;
