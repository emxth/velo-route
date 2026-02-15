import logger from "../config/logger.js";
import { registerUser, loginUser } from "../services/authService.js";

export const register = async (req, res) => {
  try {
    const { status, data, error } = await registerUser(req.body);
    if (error) return res.status(status).json({ message: error });
    logger.info("user_registered", { userId: data.user.id, email: data.user.email, role: data.user.role });
    return res.status(status).json(data);
  } catch (err) {
    logger.error("register_failed", { error: err.message, stack: err.stack });
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { status, data, error } = await loginUser(req.body);
    if (error) return res.status(status).json({ message: error });
    logger.info("user_logged_in", { userId: data.user.id, email: data.user.email, role: data.user.role });
    return res.status(status).json(data);
  } catch (err) {
    logger.error("login_failed", { error: err.message, stack: err.stack });
    return res.status(500).json({ message: "Server error" });
  }
};