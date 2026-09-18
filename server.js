import "dotenv/config";

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import coursesRoutes from "./routes/coursesRoutes.js";
import courseCategoriesRoutes from "./routes/courseCategoriesRoutes.js";
import courseDurationsRoutes from "./routes/courseDurationsRoutes.js";
import courseModulesRoutes from "./routes/courseModulesRoutes.js";
import moduleLessonsRoutes from "./routes/moduleLessonsRoutes.js";
import lessonMediaRoutes from "./routes/lessonMediaRoutes.js";
import blogsRoutes from "./routes/blogsRoutes.js";
import blogCategoriesRoutes from "./routes/blogCategoriesRoutes.js";
import blogTagsRoutes from "./routes/blogTagsRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js"; 
import sitemapRoute from "./routes/sitemap.js";

import errorHandler from "./middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


app.use(cors());

app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.get("/privacy-policy", (req, res) => {
  res.sendFile(path.join(__dirname, "privacy-policies-skyraanacademy.html"));
});

app.get("/terms-of-use", (req, res) => {
  res.sendFile(path.join(__dirname, "terms-use-skyraanacademy.html"));
});


app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/course-categories", courseCategoriesRoutes);
app.use("/api/course-durations", courseDurationsRoutes);
app.use("/api/course-modules", courseModulesRoutes);
app.use("/api/module-lessons", moduleLessonsRoutes);
app.use("/api/lesson-media", lessonMediaRoutes);  
app.use("/api/blogs", blogsRoutes);
app.use("/api/blog-categories", blogCategoriesRoutes);
app.use("/api/blog-tags", blogTagsRoutes);

app.use("/api/gallery", galleryRoutes);

app.use("/api/contact", enquiryRoutes);
app.use("/", sitemapRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on PORT ${PORT}`);
});
