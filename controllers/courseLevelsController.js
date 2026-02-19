import db from "../db.js";

/* =========================
   GET ALL COURSE LEVELS
   Admin → all (except deleted)
   Public → Active only
========================= */
export const getCourseLevels = async (req, res, next) => {
  try {
    const { all } = req.query;

    let sql = `
      SELECT *
      FROM course_levels
      WHERE deleted_at IS NULL
    `;

    // Public UI → only Active
    if (!all) {
      sql += " AND status = 'Active'";
    }

    sql += " ORDER BY level_name ASC";

    const [rows] = await db.query(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/* =========================
   GET SINGLE LEVEL (ADMIN)
========================= */
export const getCourseLevelById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM course_levels
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Course level not found",
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/* =========================
   CREATE LEVEL (ADMIN)
========================= */
export const createCourseLevel = async (req, res, next) => {
  try {
    const { level_name, status } = req.body;

    if (!level_name) {
      return res.status(400).json({
        success: false,
        message: "level_name is required",
      });
    }

    await db.query(
      `
      INSERT INTO course_levels
      (level_name, status)
      VALUES (?, ?)
      `,
      [level_name, status ?? "Active"]
    );

    res.status(201).json({
      success: true,
      message: "Course level created successfully",
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   UPDATE LEVEL (ADMIN)
========================= */
export const updateCourseLevel = async (req, res, next) => {
  try {
    const { level_name, status } = req.body;

    await db.query(
      `
      UPDATE course_levels SET
        level_name = ?,
        status = ?
      WHERE id = ?
      `,
      [level_name, status, req.params.id]
    );

    res.json({
      success: true,
      message: "Course level updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   SOFT DELETE LEVEL (ADMIN)
========================= */
export const deleteCourseLevel = async (req, res, next) => {
  try {
    await db.query(
      `
      UPDATE course_levels
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Course level deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
