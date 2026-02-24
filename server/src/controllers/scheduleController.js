import { logger } from "../utils/logger.js";

export class ScheduleController {

    constructor(scheduleService) {
        this.scheduleService = scheduleService;
    }

    //create schedule
    async create(req, res) {
        try {
            const result = await this.scheduleService.createSchedule(req.body);
            logger.info("Schedule Created");
            res.status(201).json(result);
        } catch (err) {
            logger.error(err.message);
            res.status(400).json({ error: err.message })
        }
    }

    //get all schedules
    async getAllSchedules(req, res) {
        try {
            const schedule = await this.scheduleService.getAllSchedule(req.query);
            res.status(201).json({ message: "Schedules retrieved successfully", schedule });
            logger.info("Retreiv all schedules");
        } catch (err) {
            res.status(500).json({ error: err.message });
            logger.error("Something went to error", err)
        }
    }

    //get specific schedules
    async getSpecificSchedule(req, res) {
        try {
            const schedule = await this.scheduleService.getScheduleById(req.params.id);
            res.status(200).json({ message: "Successfully retrieved schedule", schedule });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    //function for scheule update
    async updateSchedule(req, res) {
        try {
            const schedule = await this.scheduleService.updateSchedual(req.params.id, req.body);
            res.status(200).json({ message: "Update Schedule Successfully", schedule });
            logger.info("Successfully")
        } catch (err) {
            res.status(400).json({ message: "Update unsuccessfully...", error: err.message });
            logger.error("Update unsuccessfully...", err);
        }
    }

}