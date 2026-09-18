
import db from "../db.js";

export const getGallerySections = async (includeInactive = false) => {
  const query = includeInactive
    ? `
        SELECT
          id,
          section_name,
          sort_order,
          status,
          created_at,
          updated_at
        FROM gallery_sections
        ORDER BY sort_order ASC, id ASC
      `
    : `
        SELECT
          id,
          section_name,
          sort_order,
          status,
          created_at,
          updated_at
        FROM gallery_sections
        WHERE status = 'active'
        ORDER BY sort_order ASC, id ASC
      `;

  const [rows] = await db.query(query);

  return rows;
};

export const getGallerySectionById = async (id) => {
  const [rows] = await db.query(
    `
      SELECT
        id,
        section_name,
        sort_order,
        status,
        created_at,
        updated_at
      FROM gallery_sections
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

export const createGallerySection = async ({
  section_name,
  sort_order = 0,
  status = "active",
}) => {
  const [result] = await db.query(
    `
      INSERT INTO gallery_sections
        (section_name, sort_order, status)
      VALUES (?, ?, ?)
    `,
    [section_name, sort_order, status]
  );

  return getGallerySectionById(result.insertId);
};

export const updateGallerySection = async (
  id,
  { section_name, sort_order, status }
) => {
  const [result] = await db.query(
    `
      UPDATE gallery_sections
      SET
        section_name = ?,
        sort_order = ?,
        status = ?
      WHERE id = ?
    `,
    [section_name, sort_order, status, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getGallerySectionById(id);
};

export const updateGallerySectionStatus = async (id, status) => {
  const [result] = await db.query(
    `
      UPDATE gallery_sections
      SET status = ?
      WHERE id = ?
    `,
    [status, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getGallerySectionById(id);
};

export const deleteGallerySection = async (id) => {
  const [result] = await db.query(
    `
      DELETE FROM gallery_sections
      WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows > 0;
};

export const getGalleryItems = async ({
  section_id = null,
  includeInactive = false,
} = {}) => {
  const conditions = [];
  const params = [];

  if (section_id !== null && section_id !== undefined) {
    conditions.push("gi.section_id = ?");
    params.push(section_id);
  }

  if (!includeInactive) {
    conditions.push("gi.status = 'active'");
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const [rows] = await db.query(
    `
      SELECT
        gi.id,
        gi.section_id,
        gs.section_name,
        gi.title,
        gi.media_type,
        gi.media_path,
        gi.sort_order,
        gi.status,
        gi.created_at,
        gi.updated_at
      FROM gallery_items gi
      INNER JOIN gallery_sections gs
        ON gs.id = gi.section_id
      ${whereClause}
      ORDER BY
        gi.section_id ASC,
        gi.sort_order ASC,
        gi.id ASC
    `,
    params
  );

  return rows;
};

export const getGalleryItemById = async (id) => {
  const [rows] = await db.query(
    `
      SELECT
        gi.id,
        gi.section_id,
        gs.section_name,
        gi.title,
        gi.media_type,
        gi.media_path,
        gi.sort_order,
        gi.status,
        gi.created_at,
        gi.updated_at
      FROM gallery_items gi
      INNER JOIN gallery_sections gs
        ON gs.id = gi.section_id
      WHERE gi.id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

export const createGalleryItem = async ({
  section_id,
  title = null,
  media_type,
  media_path,
  sort_order = 0,
  status = "active",
}) => {
  const [result] = await db.query(
    `
      INSERT INTO gallery_items
        (
          section_id,
          title,
          media_type,
          media_path,
          sort_order,
          status
        )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      section_id,
      title,
      media_type,
      media_path,
      sort_order,
      status,
    ]
  );

  return getGalleryItemById(result.insertId);
};

export const updateGalleryItem = async (
  id,
  {
    section_id,
    title = null,
    media_type,
    media_path,
    sort_order,
    status,
  }
) => {
  const [result] = await db.query(
    `
      UPDATE gallery_items
      SET
        section_id = ?,
        title = ?,
        media_type = ?,
        media_path = ?,
        sort_order = ?,
        status = ?
      WHERE id = ?
    `,
    [
      section_id,
      title,
      media_type,
      media_path,
      sort_order,
      status,
      id,
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getGalleryItemById(id);
};

export const updateGalleryItemStatus = async (id, status) => {
  const [result] = await db.query(
    `
      UPDATE gallery_items
      SET status = ?
      WHERE id = ?
    `,
    [status, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getGalleryItemById(id);
};

export const deleteGalleryItem = async (id) => {
  const [result] = await db.query(
    `
      DELETE FROM gallery_items
      WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows > 0;
};