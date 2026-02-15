import { User } from "../models/User.js";

const FULL_ADMIN_NAV = ["admin", "operator", "driver", "analyst"];
const DEFAULT_USER_NAV = ["dashboard"];

const shapeNav = (user) => {
  if (!user) return DEFAULT_USER_NAV;
  if (user.role === "admin") return FULL_ADMIN_NAV;
  return user.allowedNav && user.allowedNav.length ? user.allowedNav : DEFAULT_USER_NAV;
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

export const getMyPermissions = async (user) => {
  return { allowedNav: shapeNav(user) };
};

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

export const constants = {
  FULL_ADMIN_NAV,
  DEFAULT_USER_NAV,
};