import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";

dotenv.config({ path: "../.env" }); // point to root .env if that's where yours is
connectDB();

const app = express();
const rawOrigins = process.env.CORS_ORIGIN || "";
const allowedOrigins = rawOrigins.split(",").map((s) => s.trim()).filter(Boolean);
const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser requests (e.g., Postman) which have no origin
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("CORS policy: origin not allowed"));
    },
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => res.send("VeloRoute API running"));

const port = process.env.PORT;
app.listen(port, () => console.log(`Server running on port ${port}`));