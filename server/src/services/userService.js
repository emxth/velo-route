import { User } from "../models/User.js";

const FULL_ADMIN_NAV = ["admin", "operator", "driver", "analyst"];
const DEFAULT_USER_NAV = ["dashboard"];

const shapeNav = (user) => {
  if (!user) return DEFAULT_USER_NAV;
  if (user.role === "admin") return FULL_ADMIN_NAV;
  return user.allowedNav && user.allowedNav.length ? user.allowedNav : DEFAULT_USER_NAV;
};

const shapeUser = (user) =>
  user && {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    allowedNav: shapeNav(user),
  };

export const listUsers = async () => {
  const users = await User.find().select("name email role allowedNav");
  return users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    allowedNav: shapeNav(u),
  }));
};

export const getMyPermissions = async (user) => ({ allowedNav: shapeNav(user) });

export const getUserPermissions = async (userId) => {
  const user = await User.findById(userId).select("allowedNav role");
  return { allowedNav: shapeNav(user) };
};

export const updateUserPermissions = async (userId, allowedNavInput) => {
  const nextNav = allowedNavInput && allowedNavInput.length ? allowedNavInput : DEFAULT_USER_NAV;
  const user = await User.findByIdAndUpdate(
    userId,
    { allowedNav: nextNav },
    { new: true }
  ).select("allowedNav role email");
  return { user, allowedNav: shapeNav(user) };
};

export const getCurrentUserDetails = async (userId) => {
  const user = await User.findById(userId).select("-password");
  return shapeUser(user);
};

export const updateCurrentUserDetails = async (userId, { name, email, password }) => {
  const user = await User.findById(userId);
  if (!user) return null;

  if (email && email !== user.email) {
    const exists = await User.findOne({ email });
    if (exists) throw new Error("Email already used");
    user.email = email;
  }
  if (name) user.name = name;
  if (password) user.password = password; // will hash on save
  await user.save();
  return shapeUser(user);
};

export const deleteCurrentUser = async (userId) => {
  await User.findByIdAndDelete(userId);
  return true;
};

export const getUserDetailsById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  return shapeUser(user);
};

export const constants = {
  FULL_ADMIN_NAV,
  DEFAULT_USER_NAV,
};