import express from "express";
import { RouteController } from "../controllers/routeController";

const router = express.Router();
const controller = new RouteController();

//route for create new Routes
router.post("/addRoute", (req, res) => controller.create(req, res));
//Route for get All Routes
router.get("/", (req, res) => controller.getAll(req, res));

//route for get specific Route
router.get("/routes/:id", (req, res) => controller.getById(req, res));

//route for update
router.put("/updateRoute/:id", (req, res) => controller.update(req, res));

//route for delete
router.delete("/clearRoute/:id", (req, res) => controller.delete(req, res));
