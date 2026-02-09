import logger from "../config/logger.js";

export const requestLogger = (req, _res, next) => {
  logger.info("http_request", { method: req.method, path: req.originalUrl, ip: req.ip });
  next();
};