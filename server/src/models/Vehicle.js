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
      uppercase: true,
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

    Department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    insurance: {
      provider: { type: String, required: true },
      policyNumber: { type: String, required: true, trim: true },
      type: {
        type: String,
        enum: ["Comprehensive", "Third Party", "Liability"],
        default: "Comprehensive",
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
      enum: ["AVAILABLE", "UNDER MAINTENANCE", "UNAVAILABLE"],
      default: "AVAILABLE",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
