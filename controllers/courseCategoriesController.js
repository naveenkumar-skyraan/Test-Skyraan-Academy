import db from "../db.js";


export const getCourseCategories = async (req, res, next) => {
  try {
    const { all } = req.query;

    let sql = `
      SELECT *
      FROM course_categories
      WHERE deleted_at IS NULL
    `;

    if (!all) {
      sql += " AND status = 'Active'";
    }

    sql += " ORDER BY created_at DESC";

    const [rows] = await db.query(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};


export const getCourseCategoryById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM course_categories
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const createCourseCategory = async (req, res, next) => {
  try {
    const { category_name, status } = req.body;

    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: "category_name is required",
      });
    }

    await db.query(
      `
      INSERT INTO course_categories
      (category_name, status)
      VALUES (?, ?)
      `,
      [category_name, status ?? "Active"]
    );

    res.status(201).json({
      success: true,
      message: "Course category created successfully",
    });
  } catch (err) {
    next(err);
  }
};


export const updateCourseCategory = async (req, res, next) => {
  try {
    const { category_name, status } = req.body;

    await db.query(
      `
      UPDATE course_categories SET
        category_name = ?,
        status = ?
      WHERE id = ?
      `,
      [category_name, status, req.params.id]
    );

    res.json({
      success: true,
      message: "Course category updated successfully",
    });
  } catch (err) {
    next(err);
  }
};


export const deleteCourseCategory = async (req, res, next) => {
  try {
    await db.query(
      `
      UPDATE course_categories
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Course category deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
