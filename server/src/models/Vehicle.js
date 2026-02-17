const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
    {
        vehiclePhoto: {
            type: String,
            required: true,
        },
        registrationNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^[A-Z0-9-]+$/],
        },
        category: {
            type: String,
            enum: ["Bus", "Train"],
            required: true,
        },
        type: {
            type: String,
            enum: ["Passenger", "Cargo"],
            required: true,
        },
        brand: {
            type: String,
            required: true,
        },
        model: {
            type: String,
            required: true,
        },
        yearOfManufacture: {
            type: Number,
            required: true,
            min: 2000,
            max: new Date().getFullYear(),
        },
        seatCapacity: {
            type: Number,
            min: 1,
            required: function () {
                return this.type === "Passenger";
            },
        },

        cargoCapacityKg: {
            type: Number,
            min: 1,
            required: function () {
                return this.type === "Cargo";
            },
        },
        operationalDepartment: {
            name: {
                type: String,
                required: true,
                trim: true,
            },
            contactNumber: {
                type: String,
                required: true,
                match: [/^[0-9]{10}$/],
            },
            email: {
                type: String,
                required: true,
                match: [/^\S+@\S+\.\S+$/],
                lowercase: true,
            },
        },
        insurance: {
            provider: { type: String, required: true },
            policyNumber: { type: String, required: true, trim: true },
            type: {
                type: String,
                enum: ["Comprehensive", "Third Party", "Liability"],
                default: "Third Party",
            },
            startDate: { type: Date, required: true },
            expiryDate: { type: Date, required: true },
        },
        fitness: {
            certificateNumber: { type: String, required: true },
            issueDate: { type: Date, required: true },
            expiryDate: { type: Date, required: true },
        },
        lastMaintenance: {
            date: { type: Date }, // When the maintenance was done
            maintenanceType: { type: String }, // What type of maintenance was performed
            odometer: { type: Number }, // Vehicle's kilometer reading at that time
        },
        nextMaintenanceDue: {
            date: { type: Date }, // Date when next service is due
            odometer: { type: Number }, // Kilometer reading when next service is due
        },
        status: {
            type: String,
            enum: ["Available", "Under Maintenance", "Unavailable"],
            default: "Available",
            required: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Vehicle", vehicleSchema);