import express from "express";
import {
  getCourseLevels,
  getCourseLevelById,
  createCourseLevel,
  updateCourseLevel,
  deleteCourseLevel,
} from "../controllers/courseLevelsController.js";

const router = express.Router();

router.get("/", getCourseLevels);        // ?all=true (admin)
router.get("/:id", getCourseLevelById);
router.post("/", createCourseLevel);
router.put("/:id", updateCourseLevel);
router.delete("/:id", deleteCourseLevel);

export default router;
