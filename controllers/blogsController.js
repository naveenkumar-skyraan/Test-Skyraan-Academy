import db from "../db.js";
import fs from "fs";
import path from "path";

/* =========================
   DELETE IMAGE FROM DISK
========================= */
function deleteImageIfExists(imagePath) {
  if (!imagePath) return;

  try {
    // stored path looks like: /uploads/blogs/abc.jpg
    const fullPath = path.join(process.cwd(), imagePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.warn("Image delete skipped:", err.message);
  }
}
export async function getBlogs(req, res, next) {
  try {
    const { category, tag, public: isPublic } = req.query;

    let query = `
      SELECT 
        b.*,
        c.category_name,
        t.tag_name
      FROM blogs b
      LEFT JOIN blog_categories c 
        ON b.category_id = c.id
      LEFT JOIN blog_tags t 
        ON b.tag_id = t.id
      WHERE b.deleted_at IS NULL
    `;

    const params = [];

    // 🔥 SAME LOGIC AS COURSES
    if (isPublic === "true") {
      query += ` AND b.status = 'published'`;
    }

    if (category) {
      const categoryArray = category.split(",");
      query += ` AND b.category_id IN (${categoryArray.map(() => "?").join(",")})`;
      params.push(...categoryArray);
    }

    if (tag) {
      const tagArray = tag.split(",");
      query += ` AND b.tag_id IN (${tagArray.map(() => "?").join(",")})`;
      params.push(...tagArray);
    }

    query += ` ORDER BY b.created_at DESC`;

    const [rows] = await db.query(query, params);

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}




/* =========================
   GET SINGLE BLOG
========================= */
export async function getBlogById(req, res, next) {
  try {
    const isPublic = req.query.public === "true";

    let query = `
      SELECT *
      FROM blogs
      WHERE id = ?
      AND deleted_at IS NULL
    `;

    if (isPublic) {
      query += ` AND status = 'published'`;
    }

    const [rows] = await db.query(query, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}



/* =========================
   CREATE BLOG
========================= */
export async function createBlog(req, res, next) {
  try {
    const {
      title,
      slug,
      featured_image,
      short_description,
      content,
      read_time,
      views,
      category_id,
      tag_id,
      status,
    } = req.body;

    const normalizedStatus =
      status === "published" ? "published" : "draft";

    await db.query(
      `
      INSERT INTO blogs (
        title, slug, featured_image, short_description,
        content, read_time, views,
        category_id, tag_id, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        slug,
        featured_image ?? null,
        short_description ?? null,
        content ?? null,
        read_time ?? null,
        views ?? 0,
        category_id ?? null,
        tag_id ?? null,
        normalizedStatus,
      ]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
}

/* =========================
   UPDATE BLOG
========================= */
export async function updateBlog(req, res, next) {
  try {
    const id = req.params.id;

    const {
      title,
      slug,
      featured_image,
      short_description,
      content,
      read_time,
      views,
      category_id,
      tag_id,
      status,
    } = req.body;

    const normalizedStatus =
      status === "published" ? "published" : "draft";

    /* =========================
       GET OLD IMAGE FIRST
    ========================= */
    const [existingRows] = await db.query(
      "SELECT featured_image FROM blogs WHERE id = ?",
      [id]
    );

    const oldImage = existingRows?.[0]?.featured_image || null;

    /* =========================
       IF IMAGE CHANGED → DELETE OLD
    ========================= */
    if (featured_image && oldImage && featured_image !== oldImage) {
      deleteImageIfExists(oldImage);
    }

    await db.query(
      `
      UPDATE blogs SET
        title = ?,
        slug = ?,
        featured_image = ?,
        short_description = ?,
        content = ?,
        read_time = ?,
        views = ?,
        category_id = ?,
        tag_id = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND deleted_at IS NULL
      `,
      [
        title,
        slug,
        featured_image,
        short_description,
        content,
        read_time,
        views,
        category_id,
        tag_id,
        normalizedStatus,
        id,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

/* =========================
   DELETE BLOG (SOFT)
========================= */
export async function deleteBlog(req, res, next) {
  try {
    const id = req.params.id;

    /* =========================
       GET IMAGE TO DELETE
    ========================= */
    const [rows] = await db.query(
      "SELECT featured_image FROM blogs WHERE id = ?",
      [id]
    );

    const image = rows?.[0]?.featured_image || null;

    if (image) {
      deleteImageIfExists(image);
    }

    /* =========================
       SOFT DELETE BLOG
    ========================= */
    await db.query(
      `
      UPDATE blogs
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}


/* =========================
   TOGGLE BLOG STATUS
========================= */
export async function toggleBlogStatus(req, res, next) {
  try {
    const normalizedStatus =
      req.body.status === "published" ? "published" : "draft";

    await db.query(
      `
      UPDATE blogs
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [normalizedStatus, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
