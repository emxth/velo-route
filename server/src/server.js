import dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import complaintRoutes from "./routes/complaints.js";
import { routeApi } from "./routes/routesRoute.js";
import { ScheduleRoute } from "./routes/scheduleRoute.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";

// connectDB();
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

const app = express();

const rawOrigins = process.env.CORS_ORIGIN || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin))
      return callback(null, true);
    return callback(new Error("CORS policy: origin not allowed"));
  },
  credentials: true,
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
  message: "Too many requests from this IP",
});
app.use("/api", limiter);

app.use(express.json());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));
app.use(requestLogger);

// User routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// Route routes
app.use("/api/routes", routeApi);
// Complaints route
app.use("/api/complaints", complaintRoutes);
// Booking route
app.use("/api/bookings", bookingRoutes);
// Vehicle route
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/schedules", ScheduleRoute());
// Department route
app.use("/api/departments", departmentRoutes);

app.get("/", (_req, res) => res.send("VeloRoute API running"));

//Centralized error handler
app.use(errorHandler);

/* ===========================
   START SERVER (Only if not test)
=========================== */

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () =>
    console.log(`Server running on port ${port}`)
  );
}

/* ===========================
   EXPORT APP FOR TESTING
=========================== */

export default app;