import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema({
    routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RouteT",
        required: true
    },
    vehicleID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true
    },
    depatureTime: {
        type: Date,
        required: true
    },
    arrivalTime: {
        type: Date,
        required: true
    },
    frequency: {
        type: String,
        enum: ["DAILY", "WEEKEND", "HOLIDAY"],
        default: "DAILY"
    },
    status: {
        type: String,
        enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "DELAYED"],
        default: "SCHEDULED"
    },
    active: {
        type: Boolean,
        default: true
    },
    assignAt: {
        type: Date,
        default: Date.now

    }

}, { timestamps: true });

export default mongoose.model("Schedule", ScheduleSchema);