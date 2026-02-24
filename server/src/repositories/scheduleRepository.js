import Schedule from "../models/Schedule.js";

export class ScheduleRepository {
    async create(data) {
        return await Schedule.create(data);
    }

    async findAll(filter = {}) {
        return await Schedule.find({ ...filter, active: true })
            .populate("routeId")
            .populate("vehicleId")
    };

    async findById(id) {
        return await Schedule.findById(id)
            .populate("routeId")
            .populate("vehicleId")
    }

    async findLastByVahicle(vehicleId) {
        return await Schedule.findOne({ vehicleId, active: true })
    };

    async findConflict(vehicleId, start, end) {
        return await Schedule.findOne({
            vehicleId,
            depatureTime: { $lt: end },
            arrivalTime: { $gt: start },
            active: true
        });
    }

    async deactivate(id) {
        return await Schedule.findByIdAndUpdate(
            id,
            { active: false },
            { new: true }
        )
    }

    async deleteShedule(id) {
        return await Schedule.findByIdAndDelete(id);
    }



}