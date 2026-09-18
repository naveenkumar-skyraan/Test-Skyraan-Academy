import express from "express";
import uploadGalleryMedia from "../middlewares/uploadGalleryMedia.js";
import {
  getSections,
  getSection,
  createSection,
  updateSection,
  updateSectionStatus,
  deleteSection,
  getGallery,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  updateGalleryItemStatus,
  deleteGalleryItem,
} from "../controllers/galleryController.js";

const router = express.Router();

router.get("/sections", getSections);
router.get("/sections/:id", getSection);
router.post("/sections", createSection);
router.put("/sections/:id", updateSection);
router.put("/sections/:id/status", updateSectionStatus);
router.delete("/sections/:id", deleteSection);

router.get("/", getGallery);
router.get("/:id", getGalleryItem);

router.post(
  "/",
  uploadGalleryMedia.single("media"),
  createGalleryItem
);

router.put(
  "/:id",
  uploadGalleryMedia.single("media"),
  updateGalleryItem
);

router.put(
  "/:id/status",
  updateGalleryItemStatus
);

router.delete(
  "/:id",
  deleteGalleryItem
);

export default router;