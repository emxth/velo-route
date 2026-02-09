import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import logger from "../config/logger.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already used" });

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id, user.role);

    logger.info("user_registered", { userId: user._id.toString(), email: user.email, role: user.role });

    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    logger.error("register_failed", { error: err.message, stack: err.stack });
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, user.role);

    logger.info("user_logged_in", { userId: user._id.toString(), email: user.email, role: user.role });

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    logger.error("login_failed", { error: err.message, stack: err.stack });
    return res.status(500).json({ message: "Server error" });
  }
};