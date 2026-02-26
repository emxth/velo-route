import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  createComplaint,
  createFeedback,
  listComplaints,
  getComplaintById,
  updateComplaintStatus,
  updateComplaintResponse,
  deleteComplaint,
} from "../controllers/complaintController.js";

const router = express.Router();

router.post("/", protect, createComplaint);
router.post("/feedback", protect, createFeedback);
router.get("/", protect, listComplaints);
router.get("/:id", protect, getComplaintById);
router.put("/:id/status", protect, authorize("admin"), updateComplaintStatus);
router.put("/:id/response", protect, authorize("admin"), updateComplaintResponse);
router.delete("/:id", protect, authorize("admin"), deleteComplaint);

export default router;