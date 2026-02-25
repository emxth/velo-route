import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },

    managerName: {
      type: String,
      required: [true, "Manager name is required"],
      trim: true,
    },

    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit contact number"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address",
      ],
      lowercase: true,
      trim: true,
      unique: true,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    region: {
      type: String,
      enum: [
        "Western",
        "Southern",
        "Central",
        "Northern",
        "Eastern",
        "North Western",
        "North Central",
        "Uva",
        "Sabaragamuwa",
      ],
      message: "{VALUE} is not a valid region",
<<<<<<< Updated upstream
=======
      required: [true, "Region is required"],
>>>>>>> Stashed changes
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
<<<<<<< Updated upstream
  {
    timestamps: true,
    //Include virtuals when converting to JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
=======
  { timestamps: true },
>>>>>>> Stashed changes
);

//Index for better query performance
DepartmentSchema.index({ name: 1, region: 1 });
DepartmentSchema.index({ status: 1, createdAt: -1 });
DepartmentSchema.index({ createdBy: 1 });
DepartmentSchema.index({ updatedBy: 1 });

//Virtual to get creator details easily
DepartmentSchema.virtual("creator", {
  ref: "User",
  localField: "createdBy",
  foreignField: "_id",
  justOne: true,
  options: { select: "name email role" },
});

//Virtual to get last updater details
DepartmentSchema.virtual("updater", {
  ref: "User",
  localField: "updatedBy",
  foreignField: "_id",
  justOne: true,
  options: { select: "name email role" },
});

//Middleware to log changes
DepartmentSchema.pre("save", function (next) {
  if (this.isNew) {
    console.log(
      `Creating new department: ${this.name} by user: ${this.createdBy}`,
    );
  } else {
    console.log(
      `Updating new department: ${this.name} by user: ${this.updatedBy}`,
    );
  }
});

//Middleware for findOneAndUpdate operations
DepartmentSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.updatedBy) {
    console.log(`Department update by user: ${update.updatedBy}`);
  }
});

export default mongoose.model("Department", DepartmentSchema);
