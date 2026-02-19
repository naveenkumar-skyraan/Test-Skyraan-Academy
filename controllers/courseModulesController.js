import db from "../db.js";

/* =========================
   GET MODULES BY COURSE
========================= */
export const getCourseModules = async (req, res, next) => {
  try {
    const { course_id } = req.query;

    const [rows] = await db.query(
      `
      SELECT *
      FROM course_modules
      WHERE course_id = ?
        AND deleted_at IS NULL
      ORDER BY sort_order ASC
      `,
      [course_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/* =========================
   CREATE MODULE
========================= */
export const createCourseModule = async (req, res, next) => {
  try {
    const { course_id, sort_order, title } = req.body;

    if (
      course_id === undefined ||
      sort_order === undefined ||
      title === undefined ||
      title.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "course_id, sort_order and title are required",
      });
    }

    await db.query(
      `
      INSERT INTO course_modules
        (course_id, sort_order, title, status)
      VALUES (?, ?, ?, 'Draft')
      `,
      [course_id, sort_order, title.trim()]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* =========================
   UPDATE MODULE
========================= */
export const updateCourseModule = async (req, res, next) => {
  try {
    const { sort_order, title } = req.body;
    const { id } = req.params;

    if (
      sort_order === undefined ||
      title === undefined ||
      title.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "sort_order and title are required",
      });
    }

    await db.query(
      `
      UPDATE course_modules
      SET
        sort_order = ?,
        title = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [sort_order, title.trim(), id]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* =========================
   TOGGLE STATUS ✅ FINAL FIX
========================= */
export const toggleCourseModuleStatus = async (req, res, next) => {
  try {
    // 🔥 ENUM SAFE CONVERSION (THE REAL FIX)
    const status =
      req.body.status === "published" ? "Published" : "Draft";

    await db.query(
      `
      UPDATE course_modules
      SET status = ?
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
export const deleteCourseModule = async (req, res, next) => {
  try {
    await db.query(
      `
      UPDATE course_modules
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
