import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehiclePhoto: {
      type: String,
      required: [true, "Vehicle photo is required"],
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

// Virtual to get department details
vehicleSchema.virtual("departmentDetails", {
  ref: "Department",
  localField: "department",
  foreignField: "_id",
  justOne: true,
  options: { select: "name region managerName contactNumber" },
});

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

// Middleware to check if insurance or fitness is expired
vehicleSchema.pre("save", function (next) {
  const now = new Date();

  // Auto-update status if insurance or fitness expired
  if (this.insurance.expiryDate < now || this.fitness.expiryDate < now) {
    this.status = "UNAVAILABLE";
  }
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
