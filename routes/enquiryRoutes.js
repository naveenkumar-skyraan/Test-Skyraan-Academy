import express from "express";
import { sendEnquiry } from "../controllers/enquiryController.js";

const router = express.Router();

router.post("/", sendEnquiry);

export default router;
