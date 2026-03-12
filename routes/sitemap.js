import express from "express";
import db from "../db.js";

const router = express.Router();

const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://skyraanacademy.com"
    : "http://localhost:5173";


// =========================
// MAIN SITEMAP
// =========================
router.get("/static.xml", (req, res) => {
    
  const staticPages = [
    {
      url: "/",
      priority: "1.0",
      changefreq: "daily",
      lastmod: "2026-03-07",
    },
    {
      url: "/about",
      priority: "0.9",
      changefreq: "monthly",
      lastmod: "2026-03-03",
    },
    {
      url: "/contact",
      priority: "0.9",
      changefreq: "monthly",
      lastmod: "2026-03-05",
    },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  staticPages.forEach((page) => {
    xml += `
      <url>
        <loc>${baseUrl}${page.url}</loc>
        <lastmod>${page.lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
      </url>`;
  });

  xml += `
    <url>
      <loc>${baseUrl}/courses.xml</loc>
    </url>
    <url>
      <loc>${baseUrl}/blogs.xml</loc>
    </url>`;

  xml += `</urlset>`;

  res.header("Content-Type", "application/xml");
  res.send(xml);
});


// =========================
// COURSES XML
// =========================
router.get("/courses.xml", async (req, res) => {
  try {
    const [courses] = await db.query(
      "SELECT slug, updated_at FROM courses WHERE slug IS NOT NULL"
    );

    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    courses.forEach((course) => {
      xml += `
        <url>
          <loc>${baseUrl}/courses/${encodeURIComponent(course.slug)}</loc>
          <lastmod>${new Date(course.updated_at).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating courses sitemap");
  }
});


// =========================
// BLOGS XML
// =========================
router.get("/blogs.xml", async (req, res) => {
  try {
    const [blogs] = await db.query(
      "SELECT slug, updated_at FROM blogs WHERE slug IS NOT NULL"
    );

    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    blogs.forEach((blog) => {
      xml += `
        <url>
          <loc>${baseUrl}/blogs/${encodeURIComponent(blog.slug)}</loc>
          <lastmod>${new Date(blog.updated_at).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating blogs sitemap");
  }
});

export default router;