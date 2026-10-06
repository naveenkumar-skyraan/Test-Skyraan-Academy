import express from "express";

import uploadGalleryMedia from "../middlewares/uploadGalleryMedia.js";

import {
  getGallerySections,
  getGallerySectionById,
  createGallerySection,
  updateGallerySection,
  updateGallerySectionStatus,
  deleteGallerySection,
  getGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  bulkUploadGalleryItems,
  updateGalleryItem,
  updateGalleryItemStatus,
  deleteGalleryItem,
} from "../controllers/galleryController.js";

const router = express.Router();

router.get("/sections", getGallerySections);

router.get("/sections/:id", getGallerySectionById);

router.post("/sections", createGallerySection);

router.put("/sections/:id", updateGallerySection);

router.put("/sections/:id/status", updateGallerySectionStatus);

router.delete("/sections/:id", deleteGallerySection);

router.get("/", getGalleryItems);

router.get("/:id", getGalleryItemById);

router.post(
  "/",
  uploadGalleryMedia.single("media"),
  createGalleryItem
);

router.post(
  "/bulk",
  uploadGalleryMedia.array("media", 20),
  bulkUploadGalleryItems
);

router.put(
  "/:id",
  uploadGalleryMedia.single("media"),
  updateGalleryItem
);

router.put("/:id/status", updateGalleryItemStatus);

router.delete("/:id", deleteGalleryItem);

export default router;