import db from "../db.js";

/* =========================
   GET ALL CATEGORIES
========================= */
export const getBlogCategories = async (req, res, next) => {
  try {
    const { all } = req.query;

    let sql = `
      SELECT id, category_name, status
      FROM blog_categories
      WHERE deleted_at IS NULL
    `;

    if (!all) {
      sql += " AND status = 'Active'";
    }

    sql += " ORDER BY category_name ASC";

    const [rows] = await db.query(sql);

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/* =========================
   GET CATEGORY BY ID
========================= */
export const getBlogCategoryById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `
      SELECT id, category_name, status
      FROM blog_categories
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/* =========================
   CREATE CATEGORY
========================= */
export const createBlogCategory = async (req, res, next) => {
  try {
    const { category_name } = req.body;

    if (!category_name) {
      return res.status(400).json({ success: false });
    }

    await db.query(
      `
      INSERT INTO blog_categories (category_name, status)
      VALUES (?, 'Inactive')
      `,
      [category_name]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* =========================
   UPDATE CATEGORY NAME
========================= */
export const updateBlogCategory = async (req, res, next) => {
  try {
    const { category_name } = req.body;

    await db.query(
      `
      UPDATE blog_categories
      SET category_name = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [category_name, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* =========================
   TOGGLE CATEGORY STATUS
========================= */
export const toggleBlogCategoryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    await db.query(
      `
      UPDATE blog_categories
      SET status = ?,
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
export const deleteBlogCategory = async (req, res, next) => {
  try {
    await db.query(
      `
      UPDATE blog_categories
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
