import express from "express";
import {
  getCourseDurations,
  getCourseDurationById,
  createCourseDuration,
  updateCourseDuration,
  deleteCourseDuration,
} from "../controllers/courseDurationsController.js";

const router = express.Router();

router.get("/", getCourseDurations);       // ?all=true (admin)
router.get("/:id", getCourseDurationById);
router.post("/", createCourseDuration);
router.put("/:id", updateCourseDuration);
router.delete("/:id", deleteCourseDuration);

export default router;
