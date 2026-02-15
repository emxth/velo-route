import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import logger from "../config/logger.js";
import {
  listUsers,
  getMyPermissions,
  getUserPermissions,
  updateUserPermissions,
  getCurrentUserDetails,
  updateCurrentUserDetails,
  deleteCurrentUser,
  getUserDetailsById,
} from "../services/userService.js";

const router = express.Router();

// list users (admin only)
router.get("/", protect, authorize("admin"), async (_req, res) => {
  const users = await listUsers();
  res.json(users);
});

// current user details
router.get("/me", protect, async (req, res) => {
  const user = await getCurrentUserDetails(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// update current user
router.put("/me", protect, async (req, res) => {
  try {
    const user = await updateCurrentUserDetails(req.user._id, req.body);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    if (err.message === "Email already used") {
      return res.status(409).json({ message: err.message });
    }
    logger.error("user_update_failed", { error: err.message });
    return res.status(500).json({ message: "Server error" });
  }
});

// delete current user
router.delete("/me", protect, async (req, res) => {
  await deleteCurrentUser(req.user._id);
  res.json({ ok: true });
});

// current user's permissions
router.get("/me/permissions", protect, async (req, res) => {
  const result = await getMyPermissions(req.user);
  res.json(result);
});

// get a user's permissions (admin only)
router.get("/:id/permissions", protect, authorize("admin"), async (req, res) => {
  const result = await getUserPermissions(req.params.id);
  res.json(result);
});

// update a user's permissions (admin only)
router.put("/:id/permissions", protect, authorize("admin"), async (req, res) => {
  const { allowedNav } = req.body;
  const { user, allowedNav: responseNav } = await updateUserPermissions(req.params.id, allowedNav);
  logger.info("permissions_updated", {
    targetUser: user?.email,
    role: user?.role,
    allowedNav: responseNav,
  });
  res.json({ allowedNav: responseNav });
});

// get a user's full details (admin only)
router.get("/:id", protect, authorize("admin"), async (req, res) => {
  const user = await getUserDetailsById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

export default router;