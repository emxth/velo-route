import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const roles = ["admin", "operator", "driver", "analyst", "user"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: roles, default: "user" },
    allowedNav: {
      type: [String],
      default: function () {
        return this.role === "admin"
          ? ["dashboard", "admin", "operator", "driver", "analyst"]
          : ["dashboard"];
      },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

export const User = mongoose.model("User", userSchema);
export const allowedRoles = roles;