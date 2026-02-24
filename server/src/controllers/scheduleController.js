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

}