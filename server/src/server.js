import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { routeApi } from "./routes/routesRoute.js";

dotenv.config({ path: "../.env" });
connectDB();

const app = express();
const rawOrigins = process.env.CORS_ORIGIN || "";
const allowedOrigins = rawOrigins.split(",").map((s) => s.trim()).filter(Boolean);
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("CORS policy: origin not allowed"));
    },
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));
app.use(requestLogger);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/routes", routeApi);

app.get("/", (_req, res) => res.send("VeloRoute API running"));

// centralized error handler
app.use(errorHandler);

const port = process.env.PORT;
app.listen(port, () => console.log(`Server running on port ${port}`));