import mongoose from "mongoose";

const RouteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    routeNumber: {
        type: String,
        required: true,
        unique: true
    },
    transportType: "Bus" | "Van" | "Train",
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
    updatedAt:{
        default:Date.now()
    }

}, { timestamps: true });