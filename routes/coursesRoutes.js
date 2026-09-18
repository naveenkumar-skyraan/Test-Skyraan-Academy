import express from "express";
import upload from "../middlewares/upload.js";

import {
  getCourses,
  getCourseById,
  getCourseBySlug,    
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
  uploadCourseThumbnail,
} from "../controllers/coursesController.js";

const router = express.Router();

router.get("/", getCourses);

router.get("/slug/:slug", getCourseBySlug); 

router.get("/:id", getCourseById);

router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);
router.put("/:id/status", toggleCourseStatus);

router.post(
  "/upload-thumbnail",
  upload.single("thumbnail"),
  uploadCourseThumbnail
);

export default router;
