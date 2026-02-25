import { RouteRepository } from "../repositories/RouteRepository.js";
import { ScheduleRepository } from "../repositories/scheduleRepository.js";
import { logger } from "../utils/logger.js";

export class ScheduleService {

    constructor(repo = new ScheduleRepository, routeRep = new RouteRepository) {
        this.scheduleRepo = repo;
        this.routeRepo = routeRep;
    }

    //function for new schedule
    async createSchedule(scheduleData) {

        const data = { ...scheduleData };

        //get Route details from route table
        const route = await this.routeRepo.findById(scheduleData.routeId);
        if (!route) throw new Error("Route not Found");

        const start = new Date(scheduleData.depatureTime);

        //get osrm generate duration time from route
        const duration = route.estimatedDuration;
        const end = new Date(start.getTime() + duration * 60000);

        //check vehicle last trip
        const lastTrip = await this.scheduleRepo.findLastByVehicle(scheduleData.vehicleID);

        //check vehicle availability
        if (lastTrip && start < lastTrip.arrivalTime) {
            throw new Error("Vehicle still busy from previous trip");

        }

        //check any conflict detection
        const conflict = await this.scheduleRepo.findConflict(
            scheduleData.vehicleID,
            start,
            end
        );

        if (conflict) {
            throw new Error("Schedule Conflict detected");
        }

        return this.scheduleRepo.create({
            ...scheduleData,
            depatureTime: start,
            arrivalTime: end

        })

    }

    //function for retrieve all schedule
    async getAllSchedule(filter) {
        return this.scheduleRepo.findAll();
    }

    //function for retreive specific schedule
    async getScheduleById(id) {
        const schedule = await this.scheduleRepo.findById(id);
        if (!schedule) {
            throw new Error("Schedule not found", 404);
        }
        return schedule;
    }

    //function for update schedules
    async updateSchedual(id, data) {

        //check and get existing data
        const existing = await this.scheduleRepo.findById(id);

        if (!existing) throw new Error("Schedule not Found", 404);

        //get Route details from route table
        const route = await this.routeRepo.findById(existing.routeId || data.routeId);
        if (!route) throw new Error("Route not Found");

        //when the time/vehicle change check conflicts
        const newStart = new Date(data.depatureTime || existing.depatureTime);
        const duration = route.estimatedDuration;
        const newEnd = new Date(newStart.getTime() + duration * 60000);
        const vehicleId = data.vehicleID || existing.vehicleID;

        const conflict = await this.scheduleRepo.findConflict(vehicleId, newStart, newEnd);
        if (conflict) throw new Error("Vehicle Busy...", 400);

        const updateData = {
            ...data,
            ...(data.depatureTime && { arrivalTime: newEnd })
        }
        const updated = await this.scheduleRepo.update(id, updateData);
        return updated;
    }

    //function for delete
    async deleteSchedule(id) {
        const deleted = await this.scheduleRepo.deleteShedule(id);
        if (!deleted) throw new Error("Schedule not found", 400);
        return deleted;
    }


}