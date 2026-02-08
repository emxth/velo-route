import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";

dotenv.config({ path: "../.env" }); // point to root .env if that's where yours is
connectDB();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => res.send("VeloRoute API running"));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));