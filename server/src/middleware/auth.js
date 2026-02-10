import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
        return res.status(401).json({ message: "Not authorized" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId).select("-password");
        if (!req.user) return res.status(401).json({ message: "User not found" });
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token invalid or expired" });
    }
};

// Role-based guard
export const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
};