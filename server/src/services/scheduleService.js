import { RouteRepository } from "../repositories/RouteRepository.js";
import { ScheduleRepository } from "../repositories/scheduleRepository.js";

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
        const lastTrip = await this.scheduleRepo.findLastByVahicle(scheduleData.vehicleID);

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


}