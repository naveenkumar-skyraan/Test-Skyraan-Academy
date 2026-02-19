import express from "express";
import upload from "../middlewares/upload.js";

import {
  getCourses,
  getCourseById,
  getCourseBySlug,        // ✅ ADD THIS
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
  uploadCourseThumbnail,
} from "../controllers/coursesController.js";

const router = express.Router();

/* ================= PUBLIC ================= */
router.get("/", getCourses);

/* 🔥 MUST COME BEFORE "/:id" */
router.get("/slug/:slug", getCourseBySlug);   // ✅ NEW ROUTE

router.get("/:id", getCourseById);

/* ================= CRUD ================= */
router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);
router.put("/:id/status", toggleCourseStatus);

/* ================= UPLOAD ================= */
router.post(
  "/upload-thumbnail",
  upload.single("thumbnail"),
  uploadCourseThumbnail
);

export default router;
