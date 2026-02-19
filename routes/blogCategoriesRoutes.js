import express from "express";
import {
  getBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  toggleBlogCategoryStatus,
  deleteBlogCategory,
} from "../controllers/blogCategoriesController.js";

const router = express.Router();

router.get("/", getBlogCategories);
router.post("/", createBlogCategory);
router.put("/:id", updateBlogCategory);
router.put("/:id/status", toggleBlogCategoryStatus);
router.delete("/:id", deleteBlogCategory);

export default router;
