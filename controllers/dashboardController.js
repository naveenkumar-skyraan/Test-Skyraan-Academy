import db from "../db.js";

/* =========================
   DASHBOARD SUMMARY (ADMIN)
========================= */
export const getDashboardData = async (req, res, next) => {
  try {
    /* ========= COUNTS ========= */

    const [[courseTotal]] = await db.query(
      "SELECT COUNT(*) AS count FROM courses"
    );

    const [[coursePublished]] = await db.query(
      "SELECT COUNT(*) AS count FROM courses WHERE status = 'Published'"
    );

    const [[courseDraft]] = await db.query(
      "SELECT COUNT(*) AS count FROM courses WHERE status = 'Draft'"
    );

    const [[blogTotal]] = await db.query(
      "SELECT COUNT(*) AS count FROM blogs"
    );

    const [[blogPublished]] = await db.query(
      "SELECT COUNT(*) AS count FROM blogs WHERE status = 'Published'"
    );

    const [[blogDraft]] = await db.query(
      "SELECT COUNT(*) AS count FROM blogs WHERE status = 'Draft'"
    );

    /* ========= CATEGORY CHARTS ========= */

    const [coursesByCategory] = await db.query(`
      SELECT cc.category_name AS name, COUNT(c.id) AS total
      FROM courses c
      LEFT JOIN course_categories cc ON cc.id = c.category_id
      GROUP BY cc.id
      ORDER BY total DESC
    `);

    const [blogsByCategory] = await db.query(`
      SELECT bc.category_name AS name, COUNT(b.id) AS total
      FROM blogs b
      LEFT JOIN blog_categories bc ON bc.id = b.category_id
      GROUP BY bc.id
      ORDER BY total DESC
    `);

    /* ========= RECENT ACTIVITY ========= */

    const [recentActivity] = await db.query(`
      (
        SELECT 
          c.id,
          c.title,
          'Course' AS type,
          cc.category_name AS category,
          c.status,
          c.updated_at
        FROM courses c
        LEFT JOIN course_categories cc ON cc.id = c.category_id
      )
      UNION ALL
      (
        SELECT
          b.id,
          b.title,
          'Blog' AS type,
          bc.category_name AS category,
          b.status,
          b.updated_at
        FROM blogs b
        LEFT JOIN blog_categories bc ON bc.id = b.category_id
      )
      ORDER BY updated_at DESC
      LIMIT 6
    `);

    /* ========= RESPONSE ========= */

    res.json({
      success: true,
      cards: {
        courses: {
          total: courseTotal.count,
          published: coursePublished.count,
          draft: courseDraft.count,
        },
        blogs: {
          total: blogTotal.count,
          published: blogPublished.count,
          draft: blogDraft.count,
        },
      },
      donut: {
        published: coursePublished.count + blogPublished.count,
        draft: courseDraft.count + blogDraft.count,
      },
      charts: {
        coursesByCategory,
        blogsByCategory,
      },
      recentActivity,
    });

  } catch (err) {
    next(err);
  }
};
