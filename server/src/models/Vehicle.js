import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehiclePhoto: {
      type: String,
      required: true,
    },

    cloudinaryId: {
      type: String,
    },

    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^[A-Z0-9-]+$/,
        "Registration number can only contain uppercase letters, numbers, and hyphens",
      ],
    },

    category: {
      type: String,
      enum: ["Bus", "Train"],
      required: [true, "Category is required"],
    },

    type: {
      type: String,
      enum: ["Passenger", "Cargo"],
      required: [true, "Type is required"],
    },

    brand: {
      type: String,
      required: [true, "Vehicle brand is required"],
      trim: true,
    },

    model: {
      type: String,
      required: [true, "Vehicle model is required"],
      trim: true,
    },

    yearOfManufacture: {
      type: Number,
      required: [true, "Year of manufacture is required"],
      min: [2000, "Year must be 2000 or later"],
      max: [
        new Date().getFullYear(),
        `Year cannot be later than ${new Date().getFullYear()}`,
      ],
    },

    seatCapacity: {
      type: Number,
      min: [1, "Seat capacity must be at least 1"],
      required: function () {
        return this.type === "Passenger";
      },
    },

    cargoCapacityKg: {
      type: Number,
      min: [500, "Cargo capacity must be at least 500 kg"],
      required: function () {
        return this.type === "Cargo";
      },
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
      index: true,
    },

    insurance: {
      provider: {
        type: String,
        required: [true, "Insurance provider is required"],
        trim: true,
      },
      policyNumber: {
        type: String,
        required: [true, "Policy number is required"],
        trim: true,
        uppercase: true,
      },
      type: {
        type: String,
        enum: ["Comprehensive", "Third Party", "Liability"],
        default: "Comprehensive",
      },
      startDate: {
        type: Date,
        required: [true, "Insurance start date is required"],
      },
      expiryDate: {
        type: Date,
        required: [true, "Insurance expiry date is required"],
      },
    },

    fitness: {
      certificateNumber: {
        type: String,
        required: [true, "Fitness certificate number is required"],
        trim: true,
        uppercase: true,
      },
      issueDate: {
        type: Date,
        required: [true, "Fitness issue date is required"],
      },
      expiryDate: {
        type: Date,
        required: [true, "Fitness expiry date is required"],
      },
    },

    lastMaintenance: {
      date: { type: Date }, // When the maintenance was done
      maintenanceType: {
        type: String,
        trim: true,
      }, // What type of maintenance was performed
      odometer: {
        type: Number,
        min: [0, "Odometer reading cannot be negative"],
      }, // Vehicle's kilometer reading at that time
    },

    nextMaintenanceDue: {
      date: { type: Date }, // Date when next service is due
      odometer: {
        type: Number,
        min: [0, "Odometer reading cannot be negative"],
      }, // Kilometer reading when next service is due
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

//Indexes for better query performance
vehicleSchema.index({ department: 1, status: 1 });
vehicleSchema.index({ category: 1, type: 1 });
vehicleSchema.index({ "insurance.expiryDate": 1 });
vehicleSchema.index({ "fitness.expiryDate": 1 });
vehicleSchema.index({ "nextMaintenanceDue.date": 1 });

// Add 'status' field to departmentDetails virtual (so we can check if department is inactive)
vehicleSchema.virtual("departmentDetails", {
  ref: "Department",
  localField: "department",
  foreignField: "_id",
  justOne: true,
  options: { select: "name region managerName contactNumber status" }, // ← added status
});

// Add instance method to compute effective status based on rules
vehicleSchema.methods.getEffectiveStatus = function (departmentStatus) {
  const now = new Date();

  // 1. Department inactive → UNAVAILABLE
  if (departmentStatus === "inactive") return "UNAVAILABLE";

  // 2. Insurance or fitness expired → UNAVAILABLE
  if (this.insurance?.expiryDate && new Date(this.insurance.expiryDate) <= now)
    return "UNAVAILABLE";
  if (this.fitness?.expiryDate && new Date(this.fitness.expiryDate) <= now)
    return "UNAVAILABLE";

  // 3. Next maintenance due date passed → UNDER MAINTENANCE
  if (
    this.nextMaintenanceDue?.date &&
    new Date(this.nextMaintenanceDue.date) <= now
  ) {
    return "UNDER MAINTENANCE";
  }

  // 4. Otherwise keep the stored status (or default AVAILABLE)
  return this.status || "AVAILABLE";
};

// Virtual to get creator details
vehicleSchema.virtual("creator", {
  ref: "User",
  localField: "createdBy",
  foreignField: "_id",
  justOne: true,
  options: { select: "name email role" },
});

// Virtual to get last updater details
vehicleSchema.virtual("updater", {
  ref: "User",
  localField: "updatedBy",
  foreignField: "_id",
  justOne: true,
  options: { select: "name email role" },
});

// Method to check if vehicle is available
vehicleSchema.methods.isAvailable = function () {
  const now = new Date();
  return (
    this.status === "AVAILABLE" &&
    this.insurance.expiryDate > now &&
    this.fitness.expiryDate > now
  );
};

export default mongoose.model("Vehicle", vehicleSchema);
