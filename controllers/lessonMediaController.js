import db from "../db.js";

/* =========================
   GET MEDIA BY LESSON
========================= */
export const getLessonMedia = async (req, res, next) => {
  try {
    const { lesson_id } = req.query;

    if (!lesson_id) {
      return res.status(400).json({
        success: false,
        message: "lesson_id is required",
      });
    }

    const [rows] = await db.query(
      `
      SELECT *
      FROM lesson_media
      WHERE lesson_id = ?
        AND deleted_at IS NULL
      ORDER BY sort_order ASC
      `,
      [lesson_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/* =========================
   CREATE MEDIA
========================= */
export const createLessonMedia = async (req, res, next) => {
  try {
    const { lesson_id, sort_order, media_type, file_path } = req.body;

    if (
      lesson_id === undefined ||
      sort_order === undefined ||
      !media_type ||
      !file_path
    ) {
      return res.status(400).json({
        success: false,
        message:
          "lesson_id, sort_order, media_type and file_path are required",
      });
    }

    if (Number(sort_order) < 1) {
      return res.status(400).json({
        success: false,
        message: "sort_order must start from 1",
      });
    }

    await db.query(
      `
      INSERT INTO lesson_media
        (lesson_id, sort_order, media_type, file_path, status)
      VALUES (?, ?, ?, ?, 'draft')
      `,
      [
        Number(lesson_id),
        Number(sort_order),
        media_type,
        file_path,
      ]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* =========================
   UPDATE MEDIA
========================= */
export const updateLessonMedia = async (req, res, next) => {
  try {
    const { sort_order, media_type, file_path } = req.body;

    if (
      sort_order === undefined ||
      !media_type ||
      !file_path
    ) {
      return res.status(400).json({
        success: false,
        message:
          "sort_order, media_type and file_path are required",
      });
    }

    if (Number(sort_order) < 1) {
      return res.status(400).json({
        success: false,
        message: "sort_order must start from 1",
      });
    }

    await db.query(
      `
      UPDATE lesson_media SET
        sort_order = ?,
        media_type = ?,
        file_path = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [
        Number(sort_order),
        media_type,
        file_path,
        req.params.id,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* =========================
   TOGGLE STATUS (FIXED)
========================= */
export const toggleLessonMediaStatus = async (req, res, next) => {
  try {
    const status =
      req.body.status === "published" ? "published" : "draft";

    await db.query(
      `
      UPDATE lesson_media
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [status, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* =========================
   SOFT DELETE (FIXED)
========================= */
export const deleteLessonMedia = async (req, res, next) => {
  try {
    await db.query(
      `
      UPDATE lesson_media
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
