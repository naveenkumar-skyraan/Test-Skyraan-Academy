import express from "express";
import { 
  sendEnquiry, 
  getAllEnquiries,
  markEnquiryViewed,
  deleteEnquiry 
} from "../controllers/enquiryController.js";

const router = express.Router();

router.post("/", sendEnquiry);
router.get("/all", getAllEnquiries);
router.patch("/:id/status", markEnquiryViewed);
router.delete("/:id", deleteEnquiry);

export default router;