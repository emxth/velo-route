import express from "express";
import { RouteController } from "../controllers/routeController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();
const controller = new RouteController();

//route for create new Routes
router.post("/addRoute", protect, authorize("admin"), (req, res) => controller.create(req, res));
//Route for get All Routes
router.get("/", protect, (req, res) => controller.getAll(req, res));

//route for get specific Route
router.get("/route/:id", protect, (req, res) => controller.getById(req, res));

//route for update
router.put("/updateRoute/:id", protect, authorize("admin"), (req, res) => controller.update(req, res));

//route for delete
router.delete("/clearRoute/:id", protect, authorize("admin"), (req, res) => controller.delete(req, res));

export { router as routeApi }