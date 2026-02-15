import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import logger from "../config/logger.js";
import {
  listUsers,
  getMyPermissions,
  getUserPermissions,
  updateUserPermissions,
} from "../services/userService.js";

const router = express.Router();

// list users (admin only)
router.get("/", protect, authorize("admin"), async (_req, res) => {
  const users = await listUsers();
  res.json(users);
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

export default router;