import fs from "fs";
import path from "path";
import {
  fetchGallerySections,
  fetchGallerySectionById,
  addGallerySection,
  editGallerySection,
  changeGallerySectionStatus,
  removeGallerySection,
  fetchGalleryItems,
  fetchGalleryItemById,
  addGalleryItem,
  editGalleryItem,
  changeGalleryItemStatus,
  removeGalleryItem,
} from "../services/galleryService.js";

export const getSections = async (req, res) => {
  try {
    const includeInactive = req.query.all === "true";

    const data = await fetchGallerySections(includeInactive);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get gallery sections error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch gallery sections",
    });
  }
};

export const getSection = async (req, res) => {
  try {
    const data = await fetchGallerySectionById(req.params.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    const status =
      error.message === "Gallery section not found" ? 404 : 500;

    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const createSection = async (req, res) => {
  try {
    const data = await addGallerySection(req.body);

    res.status(201).json({
      success: true,
      message: "Gallery section created successfully",
      data,
    });
  } catch (error) {
    console.error("Create gallery section error:", error);

    const status =
      error.code === "ER_DUP_ENTRY" ? 409 : 400;

    res.status(status).json({
      success: false,
      message:
        error.code === "ER_DUP_ENTRY"
          ? "Gallery section already exists"
          : error.message,
    });
  }
};

export const updateSection = async (req, res) => {
  try {
    const data = await editGallerySection(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Gallery section updated successfully",
      data,
    });
  } catch (error) {
    console.error("Update gallery section error:", error);

    const status =
      error.message === "Gallery section not found"
        ? 404
        : error.code === "ER_DUP_ENTRY"
          ? 409
          : 400;

    res.status(status).json({
      success: false,
      message:
        error.code === "ER_DUP_ENTRY"
          ? "Gallery section already exists"
          : error.message,
    });
  }
};

export const updateSectionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const data = await changeGallerySectionStatus(
      req.params.id,
      status
    );

    res.status(200).json({
      success: true,
      message: "Gallery section status updated successfully",
      data,
    });
  } catch (error) {
    console.error(
      "Update gallery section status error:",
      error
    );

    const statusCode =
      error.message === "Gallery section not found"
        ? 404
        : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteSection = async (req, res) => {
  try {
    await removeGallerySection(req.params.id);

    res.status(200).json({
      success: true,
      message: "Gallery section deleted successfully",
    });
  } catch (error) {
    console.error("Delete gallery section error:", error);

    const status =
      error.message === "Gallery section not found"
        ? 404
        : 400;

    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const getGallery = async (req, res) => {
  try {
    const sectionId =
      req.query.section_id !== undefined
        ? Number(req.query.section_id)
        : null;

    const includeInactive = req.query.all === "true";

    const data = await fetchGalleryItems({
      section_id: sectionId,
      includeInactive,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get gallery error:", error);

    const status =
      error.message === "Gallery section not found"
        ? 404
        : 500;

    res.status(status).json({
      success: false,
      message: error.message || "Failed to fetch gallery",
    });
  }
};

export const getGalleryItem = async (req, res) => {
  try {
    const data = await fetchGalleryItemById(req.params.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    const status =
      error.message === "Gallery item not found"
        ? 404
        : 500;

    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const createGalleryItem = async (req, res) => {
  try {
    const mediaPath = req.file
      ? `/uploads/gallery/${req.file.filename}`
      : req.body.media_path;

    const mediaType = req.body.media_type;

    const data = await addGalleryItem({
      ...req.body,
      media_type: mediaType,
      media_path: mediaPath,
    });

    res.status(201).json({
      success: true,
      message: "Gallery item created successfully",
      data,
    });
  } catch (error) {
    console.error("Create gallery item error:", error);

    if (req.file) {
      const uploadedPath = path.join(
        process.cwd(),
        "uploads",
        "gallery",
        req.file.filename
      );

      try {
        if (fs.existsSync(uploadedPath)) {
          fs.unlinkSync(uploadedPath);
        }
      } catch (cleanupError) {
        console.error(
          "Gallery upload cleanup error:",
          cleanupError
        );
      }
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateGalleryItem = async (req, res) => {
  try {
    const existingItem = await fetchGalleryItemById(
      req.params.id
    );

    const mediaPath = req.file
      ? `/uploads/gallery/${req.file.filename}`
      : existingItem.media_path;

    const data = await editGalleryItem(
      req.params.id,
      {
        ...req.body,
        media_path: mediaPath,
      }
    );

    if (
      req.file &&
      existingItem.media_path &&
      existingItem.media_path !== mediaPath
    ) {
      const oldPath = path.join(
        process.cwd(),
        existingItem.media_path.replace(/^\/+/, "")
      );

      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (cleanupError) {
        console.error(
          "Old gallery media cleanup error:",
          cleanupError
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Gallery item updated successfully",
      data,
    });
  } catch (error) {
    console.error("Update gallery item error:", error);

    if (req.file) {
      const uploadedPath = path.join(
        process.cwd(),
        "uploads",
        "gallery",
        req.file.filename
      );

      try {
        if (fs.existsSync(uploadedPath)) {
          fs.unlinkSync(uploadedPath);
        }
      } catch (cleanupError) {
        console.error(
          "Gallery upload cleanup error:",
          cleanupError
        );
      }
    }

    const status =
      error.message === "Gallery item not found"
        ? 404
        : 400;

    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateGalleryItemStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const data = await changeGalleryItemStatus(
      req.params.id,
      status
    );

    res.status(200).json({
      success: true,
      message: "Gallery item status updated successfully",
      data,
    });
  } catch (error) {
    console.error(
      "Update gallery item status error:",
      error
    );

    const statusCode =
      error.message === "Gallery item not found"
        ? 404
        : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteGalleryItem = async (req, res) => {
  try {
    await removeGalleryItem(req.params.id);

    res.status(200).json({
      success: true,
      message: "Gallery item deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete gallery item error:",
      error
    );

    const status =
      error.message === "Gallery item not found"
        ? 404
        : 400;

    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};