import mongoose from "mongoose";

const RouteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    routeNumber: {
        type: String,
        required: true,

    },
    transportType: {
        type: String,
        enum: ["Bus", "Van", "Train"],
        required: true
    },
    startLocation: {
        name: String,
        district: String,
        lat: Number,
        lng: Number
    },
    endLocation: {
        name: String,
        district: String,
        lat: Number,
        lng: Number
    },
    stops: [{
        name: String,
        lat: Number,
        lng: Number
    }],
    distance: Number,
    estimatedDuration: Number,
    updatedAt: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });

export default mongoose.model("Route", RouteSchema);