import fs from "fs";
import path from "path";

import {
  fetchGallerySections,
  fetchGallerySectionById,
  addGallerySection,
  editGallerySection,
  updateGallerySectionStatus as updateGallerySectionStatusService,
  removeGallerySection,
  fetchGalleryItems,
  fetchGalleryItemById,
  addGalleryItem,
  editGalleryItem,
  updateGalleryItemStatus as updateGalleryItemStatusService,
  removeGalleryItem,
  addGalleryItemsBulk,
} from "../services/galleryService.js";

const removeUploadedFiles = (files = []) => {
  for (const file of files) {
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "gallery",
      file.filename
    );

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error("Failed to remove uploaded gallery file:", error);
    }
  }
};

const getErrorStatusCode = (error, notFoundMessage) => {
  return error.message === notFoundMessage ? 404 : 400;
};

export const getGallerySections = async (req, res) => {
  try {
    const data = await fetchGallerySections();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getGallerySectionById = async (req, res) => {
  try {
    const data = await fetchGallerySectionById(req.params.id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(
      getErrorStatusCode(error, "Gallery section not found")
    ).json({
      success: false,
      message: error.message,
    });
  }
};

export const createGallerySection = async (req, res) => {
  try {
    const data = await addGallerySection(req.body);

    return res.status(201).json({
      success: true,
      message: "Gallery section created successfully",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateGallerySection = async (req, res) => {
  try {
    const data = await editGallerySection(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Gallery section updated successfully",
      data,
    });
  } catch (error) {
    return res.status(
      getErrorStatusCode(error, "Gallery section not found")
    ).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateGallerySectionStatus = async (req, res) => {
  try {
    const data = await updateGallerySectionStatusService(
      req.params.id,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: "Gallery section status updated successfully",
      data,
    });
  } catch (error) {
    return res.status(
      getErrorStatusCode(error, "Gallery section not found")
    ).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteGallerySection = async (req, res) => {
  try {
    const data = await removeGallerySection(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Gallery section deleted successfully",
      data,
    });
  } catch (error) {
    return res.status(
      getErrorStatusCode(error, "Gallery section not found")
    ).json({
      success: false,
      message: error.message,
    });
  }
};

export const getGalleryItems = async (req, res) => {
  try {
    const data = await fetchGalleryItems(req.query);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getGalleryItemById = async (req, res) => {
  try {
    const data = await fetchGalleryItemById(req.params.id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(
      getErrorStatusCode(error, "Gallery item not found")
    ).json({
      success: false,
      message: error.message,
    });
  }
};

export const createGalleryItem = async (req, res) => {
  try {
    const mediaPath = req.file
      ? `/uploads/gallery/${req.file.filename}`
      : null;

    const data = await addGalleryItem({
      ...req.body,
      media_path: mediaPath,
    });

    return res.status(201).json({
      success: true,
      message: "Gallery item created successfully",
      data,
    });
  } catch (error) {
    if (req.file) {
      removeUploadedFiles([req.file]);
    }

    return res.status(
      getErrorStatusCode(error, "Gallery section not found")
    ).json({
      success: false,
      message: error.message,
    });
  }
};

export const bulkUploadGalleryItems = async (req, res) => {
  const files = req.files || [];

  if (files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one image is required",
    });
  }

  try {
    const data = await addGalleryItemsBulk({
      section_id: req.body.section_id,
      files,
    });

    return res.status(201).json({
      success: true,
      message: `${data.length} gallery images uploaded successfully`,
      data,
    });
  } catch (error) {
    removeUploadedFiles(files);

    return res.status(
      getErrorStatusCode(error, "Gallery section not found")
    ).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateGalleryItem = async (req, res) => {
  try {
    const mediaPath = req.file
      ? `/uploads/gallery/${req.file.filename}`
      : undefined;

    const data = await editGalleryItem(req.params.id, {
      ...req.body,
      ...(mediaPath !== undefined && {
        media_path: mediaPath,
      }),
    });

    return res.status(200).json({
      success: true,
      message: "Gallery item updated successfully",
      data,
    });
  } catch (error) {
    if (req.file) {
      removeUploadedFiles([req.file]);
    }

    return res.status(
      getErrorStatusCode(error, "Gallery item not found")
    ).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateGalleryItemStatus = async (req, res) => {
  try {
    const data = await updateGalleryItemStatusService(
      req.params.id,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: "Gallery item status updated successfully",
      data,
    });
  } catch (error) {
    return res.status(
      getErrorStatusCode(error, "Gallery item not found")
    ).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteGalleryItem = async (req, res) => {
  try {
    const data = await removeGalleryItem(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Gallery item deleted successfully",
      data,
    });
  } catch (error) {
    return res.status(
      getErrorStatusCode(error, "Gallery item not found")
    ).json({
      success: false,
      message: error.message,
    });
  }
};