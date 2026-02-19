import express from "express";
import {
  getBlogTags,
  getBlogTagById,
  createBlogTag,
  updateBlogTag,
  deleteBlogTag,
  toggleBlogTagStatus,
} from "../controllers/blogTagsController.js";

const router = express.Router();

router.get("/", getBlogTags);
router.get("/:id", getBlogTagById);
router.post("/", createBlogTag);
router.put("/:id", updateBlogTag);
router.put("/:id/status", toggleBlogTagStatus); // 🔥 added
router.delete("/:id", deleteBlogTag);

export default router;
