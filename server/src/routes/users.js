import express from "express";
import { User } from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";
import logger from "../config/logger.js";

const router = express.Router();
// Admin users access navigations here
const FULL_ADMIN_NAV = ["admin", "operator", "driver", "analyst"];

// list users (admin only)
router.get("/", protect, authorize("admin"), async (_req, res) => {
  const users = await User.find().select("name email role allowedNav");
  const shaped = users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    allowedNav:
      u.role === "admin"
        ? FULL_ADMIN_NAV
        : u.allowedNav && u.allowedNav.length
          ? u.allowedNav
          : ["dashboard"],
  }));
  res.json(shaped);
});

// current user's permissions
router.get("/me/permissions", protect, async (req, res) => {
  const allowedNav =
    req.user.role === "admin"
      ? FULL_ADMIN_NAV
      : req.user.allowedNav && req.user.allowedNav.length
        ? req.user.allowedNav
        : ["dashboard"];
  res.json({ allowedNav });
});

// get a user's permissions (admin only)
router.get("/:id/permissions", protect, authorize("admin"), async (req, res) => {
  const user = await User.findById(req.params.id).select("allowedNav role");
  const allowedNav =
    user?.role === "admin"
      ? FULL_ADMIN_NAV
      : user?.allowedNav && user.allowedNav.length
        ? user.allowedNav
        : ["dashboard"];
  res.json({ allowedNav });
});

// update a user's permissions (admin only)
router.put("/:id/permissions", protect, authorize("admin"), async (req, res) => {
  const { allowedNav } = req.body;
  const nextNav =
    allowedNav && allowedNav.length
      ? allowedNav
      : ["dashboard"];

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { allowedNav: nextNav },
    { new: true }
  ).select("allowedNav role email");

  const responseNav = user.role === "admin" ? FULL_ADMIN_NAV : user.allowedNav || ["dashboard"];
  logger.info("permissions_updated", {
    targetUser: user.email,
    role: user.role,
    allowedNav: responseNav,
  });

  res.json({ allowedNav: responseNav });
});

export default router;