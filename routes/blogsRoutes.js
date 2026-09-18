import express from "express";
import uploadBlogImage from "../middlewares/uploadBlogImage.js";
import {
  getBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
} from "../controllers/blogsController.js";

const router = express.Router();

router.get("/", getBlogs);
router.get("/slug/:slug", getBlogBySlug);
router.get("/:id", getBlogById);
router.post("/", createBlog);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);
router.put("/:id/status", toggleBlogStatus);
router.post(
  "/upload-featured-image",
  uploadBlogImage.single("featured_image"),
  (req, res) => {
    if (!req.file) {
      return res.json({ success: false });
    }

    res.json({
      success: true,
      path: `/uploads/blogs/${req.file.filename}`,
    });
  }
);

export default router;
