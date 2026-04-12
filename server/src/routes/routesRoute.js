import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { RouteController } from "../controllers/routeController.js";

const router = express.Router();
const controller = new RouteController();

//route for create new Routes
router.post("/", protect, authorize("admin"), (req, res) => controller.create(req, res));
//Route for get All Routes
router.get("/", protect, (req, res) => controller.getAll(req, res));

//route for get specific Route
router.get("/:id", protect, (req, res) => controller.getById(req, res));

//route for update
router.put("/:id", protect, authorize("admin"), (req, res) => controller.update(req, res));

//route for delete
router.delete("/:id", protect, authorize("admin"), (req, res) => controller.delete(req, res));

export { router as routeApi }