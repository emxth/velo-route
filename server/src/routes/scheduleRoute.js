import express from "express";
import { ScheduleService } from "../services/scheduleService.js";
import { protect, authorize } from "../middleware/auth.js";
import { ScheduleController } from "../controllers/scheduleController.js";

export const ScheduleRoute = () => {
    const router = express.Router();

    const service = new ScheduleService();

    const controller = new ScheduleController(service);


    //route for create Scheduling
    router.post("/addSchedule", protect, authorize("admin"), controller.create.bind(controller));
    //route for retrieve Schedules
    router.get("/", protect, controller.getAllSchedules.bind(controller));
    //route for specific Schedules
    router.get("/:id", protect, controller.getSpecificSchedule.bind(controller));
    //route for update Schedule
    router.put("/updateSchedule/:id", protect, authorize("admin"), controller.updateSchedule.bind(controller));
    //route for delete schedule
    router.delete("/remove/:id", protect, authorize("admin"), controller.delete.bind(controller));
    return router;
}