import db from "../db.js";

/* =========================
   GET ALL COURSE DURATIONS
   Admin → all (except deleted)
   Public → Active only
========================= */
export const getCourseDurations = async (req, res, next) => {
  try {
    const { all } = req.query;

    let sql = `
      SELECT *
      FROM course_durations
      WHERE deleted_at IS NULL
    `;

    // Public UI → only Active
    if (!all) {
      sql += " AND status = 'Active'";
    }

    sql += " ORDER BY id ASC";

    const [rows] = await db.query(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/* =========================
   GET SINGLE DURATION (ADMIN)
========================= */
export const getCourseDurationById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM course_durations
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Course duration not found",
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/* =========================
   CREATE DURATION (ADMIN)
========================= */
export const createCourseDuration = async (req, res, next) => {
  try {
    const { duration_label, status } = req.body;

    if (!duration_label) {
      return res.status(400).json({
        success: false,
        message: "duration_label is required",
      });
    }

    await db.query(
      `
      INSERT INTO course_durations
      (duration_label, status)
      VALUES (?, ?)
      `,
      [duration_label, status ?? "Active"]
    );

    res.status(201).json({
      success: true,
      message: "Course duration created successfully",
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   UPDATE DURATION (ADMIN)
========================= */
export const updateCourseDuration = async (req, res, next) => {
  try {
    const { duration_label, status } = req.body;

    await db.query(
      `
      UPDATE course_durations SET
        duration_label = ?,
        status = ?
      WHERE id = ?
      `,
      [duration_label, status, req.params.id]
    );

    res.json({
      success: true,
      message: "Course duration updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   SOFT DELETE DURATION (ADMIN)
========================= */
export const deleteCourseDuration = async (req, res, next) => {
  try {
    await db.query(
      `
      UPDATE course_durations
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Course duration deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
