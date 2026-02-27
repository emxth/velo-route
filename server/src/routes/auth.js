import express from "express";
import { register, login, forgotPassword, resetPassword } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/roles.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot", forgotPassword); // request OTP
router.post("/reset", resetPassword);   // verify OTP + set new password

// Example protected admin check
router.get("/me", protect, (req, res) => res.json({ user: req.user }));
router.get("/admin/ping", protect, authorize("admin"), (req, res) =>
    res.json({ ok: true })
);

export default router;