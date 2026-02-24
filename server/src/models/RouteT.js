import mongoose from "mongoose";

const RouteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    routeNumber: {
        type: String,

    },
    transportType: {
        type: String,
        enum: ["Bus", "Van", "Train"],
        required: true
    },
    busNumber: {
        type: String,
        required: function () {
            return this.transportType === "Bus";
        }
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
        lng: Number,
        fareFromPrevious: {
            type: Number,
            default: 0
        }
    }],
    distance: Number,
    estimatedDuration: Number,
    estimatedFare: Number,
    updatedAt: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });

export default mongoose.model("Route", RouteSchema);