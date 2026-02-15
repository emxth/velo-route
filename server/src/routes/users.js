import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import logger from "../config/logger.js";
import {
  listUsers,
  getMyPermissions,
  getUserPermissions,
  updateUserRole,
  getCurrentUserDetails,
  updateCurrentUserDetails,
  deleteCurrentUser,
  getUserDetailsById,
} from "../services/userService.js";

const router = express.Router();

// list users (admin only)
router.get("/", protect, authorize("admin"), async (_req, res, next) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (err) { next(err); }
});

// current user details
router.get("/me", protect, async (req, res, next) => {
  try {
    const user = await getCurrentUserDetails(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) { next(err); }
});

// update current user
router.put("/me", protect, async (req, res, next) => {
  try {
    const user = await updateCurrentUserDetails(req.user._id, req.body);
    res.json(user);
  } catch (err) { next(err); }
});

// delete current user
router.delete("/me", protect, async (req, res, next) => {
  try {
    await deleteCurrentUser(req.user._id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// current user's permissions
router.get("/me/permissions", protect, async (req, res, next) => {
  try {
    const result = await getMyPermissions(req.user);
    res.json(result);
  } catch (err) { next(err); }
});

// get a user's permissions (admin only)
router.get("/:id/permissions", protect, authorize("admin"), async (req, res, next) => {
  try {
    const result = await getUserPermissions(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
});

// update a user's role (admin only) -> permissions derived from role
router.put("/:id/permissions", protect, authorize("admin"), async (req, res, next) => {
  try {
    const { role } = req.body;
    const { user, allowedNav } = await updateUserRole(req.params.id, role);
    logger.info("user_role_updated", { targetUser: user?.email, role: user?.role, allowedNav });
    res.json({ allowedNav, user });
  } catch (err) { next(err); }
});

// get a user's full details (admin only)
router.get("/:id", protect, authorize("admin"), async (req, res, next) => {
  try {
    const user = await getUserDetailsById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) { next(err); }
});

export default router;