import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  submitComplaint,
  getComplaints,
  getComplaint,
  setComplaintStatus,
  setComplaintResponse,
  removeComplaint,
} from "../services/complaintService.js";

const router = express.Router();

// Create complaint
router.post("/", protect, async (req, res, next) => {
  try {
    const payload = await submitComplaint({
      userId: req.user._id,
      kind: "complaint",
      category: req.body.category,
      subject: req.body.subject,
      message: req.body.message,
    });
    res.status(201).json(payload);
  } catch (err) { next(err); }
});

// Create feedback
router.post("/feedback", protect, async (req, res, next) => {
  try {
    const payload = await submitComplaint({
      userId: req.user._id,
      kind: "feedback",
      category: req.body.category,
      subject: req.body.subject,
      message: req.body.message,
    });
    res.status(201).json(payload);
  } catch (err) { next(err); }
});

// List complaints (admin = all, user = own)
router.get("/", protect, async (req, res, next) => {
  try {
    const payload = await getComplaints({ isAdmin: req.user.role === "admin", userId: req.user._id });
    res.json(payload);
  } catch (err) { next(err); }
});

// Get single complaint
router.get("/:id", protect, async (req, res, next) => {
  try {
    const payload = await getComplaint({
      id: req.params.id,
      isAdmin: req.user.role === "admin",
      userId: req.user._id,
    });
    res.json(payload);
  } catch (err) { next(err); }
});

// Update status (admin only)
router.put("/:id/status", protect, authorize("admin"), async (req, res, next) => {
  try {
    const payload = await setComplaintStatus({
      id: req.params.id,
      status: req.body.status,
      adminId: req.user._id,
    });
    res.json(payload);
  } catch (err) { next(err); }
});

// Add admin response (admin only)
router.put("/:id/response", protect, authorize("admin"), async (req, res, next) => {
  try {
    const payload = await setComplaintResponse({
      id: req.params.id,
      text: req.body.text,
      adminId: req.user._id,
    });
    res.json(payload);
  } catch (err) { next(err); }
});

// Delete complaint (admin only)
router.delete("/:id", protect, authorize("admin"), async (req, res, next) => {
  try {
    await removeComplaint(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;