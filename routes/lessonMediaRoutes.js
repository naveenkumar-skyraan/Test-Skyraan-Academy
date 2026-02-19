import express from "express";
import {
  getLessonMedia,
  createLessonMedia,
  updateLessonMedia,
  deleteLessonMedia,
  toggleLessonMediaStatus,
} from "../controllers/lessonMediaController.js";

const router = express.Router();

router.get("/", getLessonMedia);
router.post("/", createLessonMedia);
router.put("/:id", updateLessonMedia);
router.put("/:id/status", toggleLessonMediaStatus);
router.delete("/:id", deleteLessonMedia);

export default router;
