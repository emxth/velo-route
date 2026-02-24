export class ScheduleService {

    constructor(scheduleRepo, routeRepo) {
        this.scheduleRepo = scheduleRepo;
        this.routeRepo = routeRepo;
    }

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
        const lastTrip = await this.scheduleRepo.findLastByVahicle(scheduleData.vehicleId);

        if (lastTrip && start < lastTrip.arrivalTime) {
            throw new Error("Vehicle still busy from previous trip");

        }

        //check any conflict detection
        const conflict = await this.scheduleRepo.findConflict(
            scheduleData.vehicleId,
            start,
            end
        );

        if (conflict) {
            throw new Error("Schedule Conflict detected");
        }

        return this.scheduleRepo.create({
            ...scheduleData,
            departureTime: start,
            arrivalTime: end

        })

    }
}