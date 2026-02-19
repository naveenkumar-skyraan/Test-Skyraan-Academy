import express from "express";
import {
  getCourseCategories,
  getCourseCategoryById,
  createCourseCategory,
  updateCourseCategory,
  deleteCourseCategory,
} from "../controllers/courseCategoriesController.js";

const router = express.Router();

router.get("/", getCourseCategories);
router.get("/:id", getCourseCategoryById);
router.post("/", createCourseCategory);
router.put("/:id", updateCourseCategory);
router.delete("/:id", deleteCourseCategory);

export default router;
