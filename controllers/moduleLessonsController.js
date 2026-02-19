import db from "../db.js";

/* =========================
   GET LESSONS BY MODULE
========================= */
export const getModuleLessons = async (req, res, next) => {
  try {
    const { module_id } = req.query;

    if (!module_id) {
      return res.status(400).json({ success: false, message: "module_id required" });
    }

    const [rows] = await db.query(
      `
      SELECT
        id,
        module_id,
        sort_order,
        lesson_title,
        duration_minutes,
        status,
        created_at,
        updated_at
      FROM module_lessons
      WHERE module_id = ?
        AND deleted_at IS NULL
      ORDER BY sort_order ASC
      `,
      [module_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/* =========================
   CREATE LESSON
========================= */
export const createModuleLesson = async (req, res, next) => {
  try {
    const { module_id, sort_order, lesson_title } = req.body;

    if (!module_id || !sort_order || !lesson_title) {
      return res.status(400).json({
        success: false,
        message: "module_id, sort_order and lesson_title are required",
      });
    }

    await db.query(
      `
      INSERT INTO module_lessons
      (module_id, sort_order, lesson_title, status)
      VALUES (?, ?, ?, 'draft')
      `,
      [module_id, sort_order, lesson_title.trim()]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* =========================
   UPDATE LESSON
========================= */
export const updateModuleLesson = async (req, res, next) => {
  try {
    const { sort_order, lesson_title } = req.body;

    if (!sort_order || !lesson_title) {
      return res.status(400).json({
        success: false,
        message: "sort_order and lesson_title required",
      });
    }

    await db.query(
      `
      UPDATE module_lessons
      SET
        sort_order = ?,
        lesson_title = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [sort_order, lesson_title.trim(), req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* =========================
   UPDATE STATUS (ADMIN CONTROLS)
========================= */
export const toggleModuleLessonStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (status !== "draft" && status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    await db.query(
      `
      UPDATE module_lessons
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
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
   SOFT DELETE
========================= */
export const deleteModuleLesson = async (req, res, next) => {
  try {
    await db.query(
      `
      UPDATE module_lessons
      SET
        deleted_at = CURRENT_TIMESTAMP,
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
