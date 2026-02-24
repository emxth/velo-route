import logger from "../config/logger.js";

export const errorHandler = (err, _req, res, _next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Server error";
  if (status >= 500) {
    logger.error("unhandled_error", { error: err.message, stack: err.stack });
  }
  res.status(status).json({ message });
};