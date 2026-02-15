import mongoose from "mongoose";
import {
  listUsers as repoListUsers,
  findById,
  updateUserById,
  deleteUserById,
} from "../repositories/userRepository.js";
import { ROLE_PERMISSIONS } from "../config/rolePermissions.js";
import { AppError } from "../utils/AppError.js";

const ensureValidId = (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid user id", 400);
  }
};

const shapeUser = (user) =>
  user && {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    allowedNav: ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.user,
  };

export const listUsers = async () => {
  const users = await repoListUsers();
  return users.map(shapeUser);
};

export const getCurrentUserDetails = async (userId) => {
  ensureValidId(userId);
  const user = await findById(userId, "-password");
  return shapeUser(user);
};

export const updateCurrentUserDetails = async (userId, { name, email, password }) => {
  ensureValidId(userId);
  const user = await findById(userId);
  if (!user) throw new AppError("User not found", 404);

  if (email && email !== user.email) {
    const exists = await findById(userId, null).where({ email });
    if (exists) throw new AppError("Email already used", 409);
    user.email = email;
  }
  if (name) user.name = name;
  if (password) user.password = password; // will hash on save
  await user.save();
  return shapeUser(user);
};

export const deleteCurrentUser = async (userId) => {
  ensureValidId(userId);
  await deleteUserById(userId);
  return true;
};

export const getMyPermissions = async (user) => ({
  allowedNav: ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.user,
});

export const getUserPermissions = async (userId) => {
  ensureValidId(userId);
  const user = await findById(userId, "role");
  if (!user) throw new AppError("User not found", 404);
  return { allowedNav: ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.user };
};

// Update “permissions” by changing role (since nav is role-derived)
export const updateUserRole = async (userId, role) => {
  ensureValidId(userId);
  if (!role || !ROLE_PERMISSIONS[role]) throw new AppError("Invalid role", 400);
  const user = await updateUserById(userId, { role });
  if (!user) throw new AppError("User not found", 404);
  return {
    user: shapeUser(user),
    allowedNav: ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.user,
  };
};

export const getUserDetailsById = async (userId) => {
  ensureValidId(userId);
  const user = await findById(userId, "-password");
  return shapeUser(user);
};