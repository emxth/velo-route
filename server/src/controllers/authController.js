import logger from "../config/logger.js";
import { registerUser, loginUser, resetPasswordWithOtp, requestPasswordReset } from "../services/authService.js";

// Controller layer handles HTTP requests

export const register = async (req, res, next) => {
  try {
    const data = await registerUser(req.body);
    logger.info("user_registered", { userId: data.user.id, email: data.user.email, role: data.user.role });
    return res.status(201).json(data);
  } catch (err) {
    return next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = await loginUser(req.body);
    logger.info("user_logged_in", { userId: data.user.id, email: data.user.email, role: data.user.role });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    await requestPasswordReset(req.body.email);
    return res.json({ ok: true });
  } catch (err) { return next(err); }
};

export const resetPassword = async (req, res, next) => {
  try {
    const data = await resetPasswordWithOtp(req.body);
    return res.json(data);
  } catch (err) { return next(err); }
};