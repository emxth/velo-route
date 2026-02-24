import express from "express";
import { ScheduleService } from "../services/scheduleService.js";
import { ScheduleController } from "../controllers/scheduleController.js";

export const ScheduleRoute = () => {
    const router = express.Router();

    const service = new ScheduleService();

    const controller = new ScheduleController(service);


    //route for create Scheduling
    router.post("/addSchedule", controller.create.bind(controller));
    router.get("/", controller.getAllSchedules.bind(controller));
    router.get("/:id", controller.getSpecificSchedule.bind(controller));
    return router;
}