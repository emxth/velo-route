import express from "express";
import { User } from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// list users (admin only)
router.get("/", protect, authorize("admin"), async (_req, res) => {
  const users = await User.find().select("name email role allowedNav");
  res.json(users.map(u => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    allowedNav: u.allowedNav || []
  })));
});

// GET current user's permissions
router.get("/me/permissions", protect, async (req, res) => {
  res.json({ allowedNav: req.user.allowedNav || [] });
});

// GET a user's permissions (admin only)
router.get("/:id/permissions", protect, authorize("admin"), async (req, res) => {
  const user = await User.findById(req.params.id).select("allowedNav");
  res.json({ allowedNav: user?.allowedNav || [] });
});

// PUT update a user's permissions (admin only)
router.put("/:id/permissions", protect, authorize("admin"), async (req, res) => {
  const { allowedNav } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { allowedNav: allowedNav || [] },
    { new: true }
  ).select("allowedNav");
  res.json({ allowedNav: user?.allowedNav || [] });
});

export default router;