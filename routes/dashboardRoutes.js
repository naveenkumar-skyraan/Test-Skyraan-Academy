import express from "express";
import { getDashboardData } from "../controllers/dashboardController.js";

const router = express.Router();

/* =========================
   DASHBOARD ROUTE
========================= */
router.get("/", getDashboardData);

export default router;
