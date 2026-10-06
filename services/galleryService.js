import fs from "fs";
import path from "path";

import {
  getGallerySections,
  getGallerySectionById,
  createGallerySection,
  updateGallerySection,
  updateGallerySectionStatus as updateGallerySectionStatusModel,
  deleteGallerySection,
  getGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  createGalleryItemsBulk,
  updateGalleryItem,
  updateGalleryItemStatus as updateGalleryItemStatusModel,
  deleteGalleryItem,
} from "../models/galleryModel.js";

export const fetchGallerySections = async (includeInactive = false) => {
  return await getGallerySections(includeInactive);
};

export const fetchGallerySectionById = async (id) => {
  const section = await getGallerySectionById(id);

  if (!section) {
    throw new Error("Gallery section not found");
  }

  return section;
};

export const addGallerySection = async (data) => {
  const sectionName = data.section_name?.trim();

  if (!sectionName) {
    throw new Error("Section name is required");
  }

  const sortOrder = Number.isInteger(Number(data.sort_order))
    ? Number(data.sort_order)
    : 0;

  const status =
    data.status === "inactive" ? "inactive" : "active";

  return await createGallerySection({
    section_name: sectionName,
    sort_order: sortOrder,
    status,
  });
};

export const editGallerySection = async (id, data) => {
  const existingSection = await getGallerySectionById(id);

  if (!existingSection) {
    throw new Error("Gallery section not found");
  }

  const sectionName = data.section_name?.trim();

  if (!sectionName) {
    throw new Error("Section name is required");
  }

  const sortOrder = Number.isInteger(Number(data.sort_order))
    ? Number(data.sort_order)
    : 0;

  const status =
    data.status === "inactive" ? "inactive" : "active";

  return await updateGallerySection(id, {
    section_name: sectionName,
    sort_order: sortOrder,
    status,
  });
};

export const changeGallerySectionStatus = async (id, status) => {
  const existingSection = await getGallerySectionById(id);

  if (!existingSection) {
    throw new Error("Gallery section not found");
  }

  if (!["active", "inactive"].includes(status)) {
    throw new Error("Invalid section status");
  }

  return await updateGallerySectionStatusModel(id, status);
};

export const updateGallerySectionStatus = changeGallerySectionStatus;

export const removeGallerySection = async (id) => {
  const existingSection = await getGallerySectionById(id);

  if (!existingSection) {
    throw new Error("Gallery section not found");
  }

  try {
    return await deleteGallerySection(id);
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new Error(
        "Cannot delete this section because gallery items are assigned to it"
      );
    }

    throw error;
  }
};

export const fetchGalleryItems = async ({
  section_id = null,
  includeInactive = false,
} = {}) => {
  if (section_id !== null && section_id !== undefined) {
    const section = await getGallerySectionById(section_id);

    if (!section) {
      throw new Error("Gallery section not found");
    }
  }

  return await getGalleryItems({
    section_id,
    includeInactive,
  });
};

export const fetchGalleryItemById = async (id) => {
  const item = await getGalleryItemById(id);

  if (!item) {
    throw new Error("Gallery item not found");
  }

  return item;
};

export const addGalleryItem = async (data) => {
  const sectionId = Number(data.section_id);

  if (!Number.isInteger(sectionId) || sectionId <= 0) {
    throw new Error("Valid section is required");
  }

  const section = await getGallerySectionById(sectionId);

  if (!section) {
    throw new Error("Gallery section not found");
  }

  if (!["image", "video"].includes(data.media_type)) {
    throw new Error("Invalid media type");
  }

  if (!data.media_path) {
    throw new Error("Media file is required");
  }

  const title = data.title?.trim() || null;
  const status =
    data.status === "inactive" ? "inactive" : "active";

  return await createGalleryItem({
    section_id: sectionId,
    title,
    media_type: data.media_type,
    media_path: data.media_path,
    status,
  });
};

export const addGalleryItemsBulk = async ({
  section_id,
  files,
}) => {
  const sectionId = Number(section_id);

  if (!Number.isInteger(sectionId) || sectionId <= 0) {
    throw new Error("Valid section is required");
  }

  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("At least one image is required");
  }

  if (files.length > 20) {
    throw new Error("Maximum 20 images are allowed per upload");
  }

  const section = await getGallerySectionById(sectionId);

  if (!section) {
    throw new Error("Gallery section not found");
  }

  const invalidFile = files.find(
    (file) => !file.mimetype?.startsWith("image/")
  );

  if (invalidFile) {
    throw new Error(
      `Only images are allowed in bulk upload: ${invalidFile.originalname}`
    );
  }

  const items = files.map((file) => {
    const title =
      path.parse(file.originalname).name.trim() || null;

    return {
      section_id: sectionId,
      title,
      media_type: "image",
      media_path: `/uploads/gallery/${file.filename}`,
      status: "active",
    };
  });

  return await createGalleryItemsBulk(items);
};

export const editGalleryItem = async (id, data) => {
  const existingItem = await getGalleryItemById(id);

  if (!existingItem) {
    throw new Error("Gallery item not found");
  }

  const sectionId = Number(data.section_id);

  if (!Number.isInteger(sectionId) || sectionId <= 0) {
    throw new Error("Valid section is required");
  }

  const section = await getGallerySectionById(sectionId);

  if (!section) {
    throw new Error("Gallery section not found");
  }

  if (!["image", "video"].includes(data.media_type)) {
    throw new Error("Invalid media type");
  }

  const mediaPath = data.media_path || existingItem.media_path;

  if (!mediaPath) {
    throw new Error("Media file is required");
  }

  const title = data.title?.trim() || null;

  const sortOrder = Number.isInteger(Number(data.sort_order))
    ? Number(data.sort_order)
    : Number(existingItem.sort_order || 0);

  const status =
    data.status === "inactive" ? "inactive" : "active";

  return await updateGalleryItem(id, {
    section_id: sectionId,
    title,
    media_type: data.media_type,
    media_path: mediaPath,
    sort_order: sortOrder,
    status,
  });
};

export const changeGalleryItemStatus = async (id, status) => {
  const existingItem = await getGalleryItemById(id);

  if (!existingItem) {
    throw new Error("Gallery item not found");
  }

  if (!["active", "inactive"].includes(status)) {
    throw new Error("Invalid gallery item status");
  }

  return await updateGalleryItemStatusModel(id, status);
};

export const updateGalleryItemStatus = changeGalleryItemStatus;

export const removeGalleryItem = async (id) => {
  const existingItem = await getGalleryItemById(id);

  if (!existingItem) {
    throw new Error("Gallery item not found");
  }

  const deleted = await deleteGalleryItem(id);

  if (deleted && existingItem.media_path) {
    const relativePath = existingItem.media_path.replace(/^\/+/, "");

    const fullPath = path.join(
      process.cwd(),
      relativePath
    );

    try {
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error(
        "Failed to delete gallery media file:",
        error
      );
    }
  }

  return deleted;
};