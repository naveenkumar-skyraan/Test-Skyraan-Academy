import db from "../db.js";

/* =========================
   GET BLOG TAGS
========================= */
export const getBlogTags = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT id, tag_name, status
      FROM blog_tags
      WHERE deleted_at IS NULL
      ORDER BY tag_name ASC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};



export const getBlogTagById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM blog_tags
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
   CREATE TAG
========================= */
export const createBlogTag = async (req, res, next) => {
  try {
    const { tag_name } = req.body;

    if (!tag_name) {
      return res.status(400).json({ success: false });
    }

    await db.query(
      `
      INSERT INTO blog_tags (tag_name, status)
      VALUES (?, 'Inactive')
      `,
      [tag_name]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* =========================
   UPDATE TAG NAME
========================= */
export const updateBlogTag = async (req, res, next) => {
  try {
    const { tag_name } = req.body;

    await db.query(
      `
      UPDATE blog_tags
      SET tag_name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [tag_name, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* =========================
   TOGGLE TAG STATUS
========================= */
export const toggleBlogTagStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    await db.query(
      `
      UPDATE blog_tags
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
   SOFT DELETE
========================= */
export const deleteBlogTag = async (req, res, next) => {
  try {
    await db.query(
      `
      UPDATE blog_tags
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
