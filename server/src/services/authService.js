import crypto from "crypto";
import { findByEmail, createUser, updateUserById } from "../repositories/userRepository.js";
import { generateToken } from "../utils/generateToken.js";
import { sendMail } from "../utils/mailer.js";
import { AppError } from "../utils/AppError.js";

// helpers
const genOtp = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
const hash = (val) => crypto.createHash("sha256").update(val).digest("hex");

export const registerUser = async ({ name, email, password, role }) => {
  if (!name || !email || !password) throw new AppError("Missing fields", 400);

  const exists = await findByEmail(email);
  if (exists) throw new AppError("Email already used", 409);

  const user = await createUser({ name, email, password, role });
  const token = generateToken(user._id, user.role);
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await findByEmail(email);
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid credentials", 401);
  }
  const token = generateToken(user._id, user.role);
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

export const requestPasswordReset = async (email) => {
  if (!email) throw new AppError("Email required", 400);
  const user = await findByEmail(email);
  if (!user) throw new AppError("User not found", 404);

  const otp = genOtp();
  const token = hash(otp);
  const expires = Date.now() + 15 * 60 * 1000; // 15 min

  await updateUserById(user._id, {
    resetPasswordToken: token,
    resetPasswordExpires: new Date(expires),
  });

  await sendMail({
    to: user.email,
    subject: "Your password reset code",
    text: `Your OTP is ${otp}. It expires in 15 minutes.`,
    html: `<p>Your OTP is <b>${otp}</b>. It expires in 15 minutes.</p>`,
  });

  return true;
};

export const resetPasswordWithOtp = async ({ email, otp, newPassword }) => {
  if (!email || !otp || !newPassword) throw new AppError("Missing fields", 400);
  const user = await findByEmail(email);
  if (!user) throw new AppError("User not found", 404);
  if (!user.resetPasswordToken || !user.resetPasswordExpires) {
    throw new AppError("No reset requested", 400);
  }
  if (user.resetPasswordExpires.getTime() < Date.now()) {
    throw new AppError("Reset code expired", 400);
  }

  const incoming = hash(otp);
  if (incoming !== user.resetPasswordToken) throw new AppError("Invalid code", 400);

  user.password = newPassword; // will hash on save
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { ok: true };
};