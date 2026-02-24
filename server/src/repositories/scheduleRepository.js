import Schedule from "../models/Schedule.js";

export class ScheduleRepository {
    async create(data) {
        return await Schedule.create(data);
    }

    async findAll(filter = {}) {
        return await Schedule.find({ ...filter, active: true })
            .populate("routeId")
            .populate("vehicleID")
    };

    async findById(id) {
        return await Schedule.findById(id)
            .populate("routeId")
            .populate("vehicleID")
    }

    async findLastByVahicle(vehicleID) {
        return await Schedule.findOne({ vehicleID, active: true })
    };

    async findConflict(vehicleId, start, end) {
        return await Schedule.findOne({
            vehicleID: vehicleId,
            depatureTime: { $lt: end },
            arrivalTime: { $gt: start },
            active: true,
            status: { $in: ["SCHEDULED", "IN_PROGRESS"] },

            $or: [

                //new trip start during existing trip
                {
                    depatureTime: { $lte: start },
                    arrivalTime: { $gt: start }
                },
                //new trip ends existing trip
                {
                    depatureTime: { $lt: end },
                    arrivalTime: { $gte: end }
                },
                //or check schedule trip completely in existing trip
                {
                    depatureTime: { $lte: start },
                    arrivalTime: { $gte: end }
                }
            ]
        }).sort({ depatureTime: 1 });
    }

    async deactivate(id) {
        return await Schedule.findByIdAndUpdate(
            id,
            { active: false },
            { new: true }
        )
    }

    async update(id, data) {
        return Schedule.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteShedule(id) {
        return await Schedule.findByIdAndDelete(id);
    }



}