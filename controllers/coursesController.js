import db from "../db.js";
import fs from "fs";
import path from "path";

/* =========================
   GET ALL COURSES (ADMIN / PUBLIC)
========================= */
export const getCourses = async (req, res, next) => {
  try {
    const isPublic = req.query.public === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;

    const search = req.query.search || "";
    const sort = req.query.sort || "newest";

    const categoryFilter = req.query.category;
    const levelFilter = req.query.level;
    const durationFilter = req.query.duration;

    let baseQuery = `
      FROM courses c
      ${isPublic ? "INNER JOIN" : "LEFT JOIN"} course_categories cat ON cat.id = c.category_id
      ${isPublic ? "INNER JOIN" : "LEFT JOIN"} course_levels lvl ON lvl.id = c.level_id
      ${isPublic ? "INNER JOIN" : "LEFT JOIN"} course_durations dur ON dur.id = c.duration_id
      WHERE c.deleted_at IS NULL
    `;

    if (isPublic) {
      baseQuery += `
        AND LOWER(c.status) = 'published'
        AND LOWER(cat.status) = 'active'
        AND LOWER(lvl.status) = 'active'
        AND LOWER(dur.status) = 'active'
      `;
    }

    let conditions = [];
    let values = [];

    if (search) {
      conditions.push(`c.title LIKE ?`);
      values.push(`%${search}%`);
    }

    if (categoryFilter) {
      const ids = categoryFilter.split(",").map(id => parseInt(id));
      conditions.push(`c.category_id IN (${ids.map(() => "?").join(",")})`);
      values.push(...ids);
    }

    if (levelFilter) {
      const ids = levelFilter.split(",").map(id => parseInt(id));
      conditions.push(`c.level_id IN (${ids.map(() => "?").join(",")})`);
      values.push(...ids);
    }

    if (durationFilter) {
      const ids = durationFilter.split(",").map(id => parseInt(id));
      conditions.push(`c.duration_id IN (${ids.map(() => "?").join(",")})`);
      values.push(...ids);
    }

    if (conditions.length) {
      baseQuery += ` AND ` + conditions.join(" AND ");
    }

    let orderBy = ` ORDER BY c.created_at DESC `;
    if (sort === "oldest") {
      orderBy = ` ORDER BY c.created_at ASC `;
    }

    const dataQuery = `
      SELECT
        c.*,
        cat.category_name,
        lvl.level_name,
        dur.duration_label
      ${baseQuery}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      ${baseQuery}
    `;

    const dataParams = [...values, limit, offset];
    const countParams = [...values];

    const [rows] = await db.query(dataQuery, dataParams);
    const [[countResult]] = await db.query(countQuery, countParams);

    /* ================= STATIC COUNTS (PUBLIC ONLY) ================= */

    let categoryCounts = [];
    let levelCounts = [];
    let durationCounts = [];

    if (isPublic) {
      [categoryCounts] = await db.query(`
        SELECT cat.category_name, COUNT(*) as total
        FROM courses c
        INNER JOIN course_categories cat ON cat.id = c.category_id
        WHERE c.deleted_at IS NULL
        AND LOWER(c.status) = 'published'
        AND LOWER(cat.status) = 'active'
        GROUP BY c.category_id
      `);

      [levelCounts] = await db.query(`
        SELECT lvl.level_name, COUNT(*) as total
        FROM courses c
        INNER JOIN course_levels lvl ON lvl.id = c.level_id
        WHERE c.deleted_at IS NULL
        AND LOWER(c.status) = 'published'
        AND LOWER(lvl.status) = 'active'
        GROUP BY c.level_id
      `);

      [durationCounts] = await db.query(`
        SELECT dur.duration_label, COUNT(*) as total
        FROM courses c
        INNER JOIN course_durations dur ON dur.id = c.duration_id
        WHERE c.deleted_at IS NULL
        AND LOWER(c.status) = 'published'
        AND LOWER(dur.status) = 'active'
        GROUP BY c.duration_id
      `);
    }

    res.json({
      success: true,
      data: rows,
      total: countResult.total,
      page,
      totalPages: Math.ceil(countResult.total / limit),
      counts: {
        category: categoryCounts,
        level: levelCounts,
        duration: durationCounts,
      },
    });

  } catch (err) {
    next(err);
  }
};

/* =========================
   GET SINGLE COURSE (ADMIN)
========================= */
export const getCourseById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM courses WHERE id = ? AND deleted_at IS NULL`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/* =========================
   GET COURSE BY SLUG (PUBLIC)
========================= */
export const getCourseBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        c.*,
        cat.category_name,
        cat.id AS category_id,
        lvl.level_name,
        lvl.id AS level_id,
        dur.duration_label,
        dur.id AS duration_id
      FROM courses c
      INNER JOIN course_categories cat ON cat.id = c.category_id
      INNER JOIN course_levels lvl ON lvl.id = c.level_id
      INNER JOIN course_durations dur ON dur.id = c.duration_id
      WHERE
        c.slug = ?
        AND c.deleted_at IS NULL
        AND LOWER(c.status) = 'published'
        AND LOWER(cat.status) = 'active'
        AND LOWER(lvl.status) = 'active'
        AND LOWER(dur.status) = 'active'
      LIMIT 1
      `,
      [slug]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({ success: true, data: rows[0] });

  } catch (err) {
    next(err);
  }
};

/* =========================
   UPLOAD COURSE THUMBNAIL
========================= */
export const uploadCourseThumbnail = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No thumbnail uploaded",
      });
    }

    res.json({
      success: true,
      path: `/uploads/courses/${req.file.filename}`,
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   CREATE COURSE
========================= */
export const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      short_description,
      description,
      thumbnail,
      price,
      category_id,
      level_id,
      duration_id,
      discount,
      is_featured,
      popularity_score,
      status,
    } = req.body;

    const normalizedStatus =
      status === "published" ? "published" : "draft";

    const thumbnailPath = req.file
      ? `/uploads/courses/${req.file.filename}`
      : thumbnail;

    await db.query(
      `
      INSERT INTO courses (
        title, slug, short_description, description,
        thumbnail, price, category_id, level_id,
        duration_id, discount, is_featured,
        popularity_score, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        slug,
        short_description ?? null,
        description ?? null,
        thumbnailPath ?? null,
        price ?? null,
        category_id ?? null,
        level_id ?? null,
        duration_id ?? null,
        discount ?? 0,
        is_featured ?? 0,
        popularity_score ?? 0,
        normalizedStatus,
      ]
    );

    res.status(201).json({ success: true });

  } catch (err) {
    next(err);
  }
};

/* =========================
   UPDATE COURSE
========================= */
export const updateCourse = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      short_description,
      description,
      thumbnail,
      price,
      category_id,
      level_id,
      duration_id,
      discount,
      is_featured,
      popularity_score,
      status,
    } = req.body;

    const normalizedStatus =
      status === "published" ? "published" : "draft";

    const [[existing]] = await db.query(
      `SELECT thumbnail FROM courses WHERE id = ? AND deleted_at IS NULL`,
      [req.params.id]
    );

    const newThumbnailPath = req.file
      ? `/uploads/courses/${req.file.filename}`
      : thumbnail;

    if (
      req.file &&
      existing?.thumbnail &&
      existing.thumbnail !== newThumbnailPath
    ) {
      const oldFilePath = path.join(process.cwd(), existing.thumbnail);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    await db.query(
      `
      UPDATE courses SET
        title = ?, slug = ?, short_description = ?, description = ?,
        thumbnail = ?, price = ?, category_id = ?, level_id = ?,
        duration_id = ?, discount = ?, is_featured = ?,
        popularity_score = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND deleted_at IS NULL
      `,
      [
        title,
        slug,
        short_description,
        description,
        newThumbnailPath,
        price,
        category_id,
        level_id,
        duration_id,
        discount,
        is_featured,
        popularity_score,
        normalizedStatus,
        req.params.id,
      ]
    );

    res.json({ success: true });

  } catch (err) {
    next(err);
  }
};

/* =========================
   DELETE COURSE (SOFT)
========================= */
export const deleteCourse = async (req, res, next) => {
  try {
    const [[existing]] = await db.query(
      `SELECT thumbnail FROM courses WHERE id = ? AND deleted_at IS NULL`,
      [req.params.id]
    );

    await db.query(
      `
      UPDATE courses
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND deleted_at IS NULL
      `,
      [req.params.id]
    );

    if (existing?.thumbnail) {
      const filePath = path.join(process.cwd(), existing.thumbnail);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ success: true });

  } catch (err) {
    next(err);
  }
};

/* =========================
   TOGGLE COURSE STATUS
========================= */
export const toggleCourseStatus = async (req, res, next) => {
  try {
    const normalizedStatus =
      req.body.status === "published" ? "published" : "draft";

    await db.query(
      `
      UPDATE courses
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND deleted_at IS NULL
      `,
      [normalizedStatus, req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    next(err);
  }
};