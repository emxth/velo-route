const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    managerName: {
      type: String,
      required: true,
    },

    contactNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/],
    },

    email: {
      type: String,
      required: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/],
      lowercase: true,
    },

    address: {
      type: String,
      required: true,
    },

    region: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Department", DepartmentSchema);
