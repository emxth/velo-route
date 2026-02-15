import logger from "../config/logger.js";
import { registerUser, loginUser } from "../services/authService.js";

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