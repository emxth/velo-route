import mongoose from "mongoose";
import {
  listUsers as repoListUsers,
  findById,
  updateUserById,
  deleteUserById,
  createUser,
  findByEmail,
  countUsers,
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
    createdAt: user.createdAt,
    allowedNav: ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.user,
  };

const buildFilter = (search) => {
  if (!search) return {};
  const regex = new RegExp(search, "i");
  return { $or: [{ name: regex }, { email: regex }, { role: regex }] };
};

const parseSort = (sort) => {
  const [fieldRaw, dirRaw] = (sort || "createdAt:desc").split(":");
  const allowed = ["name", "email", "role", "createdAt"];
  const field = allowed.includes(fieldRaw) ? fieldRaw : "createdAt";
  const dir = dirRaw === "asc" ? 1 : -1;
  return { [field]: dir };
};

export const listUsers = async ({ search = "", page = 1, limit = 10, sort } = {}) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const filter = buildFilter(search);
  const sortObj = parseSort(sort);

  const users = await repoListUsers({ filter, skip, limit: limitNum, sort: sortObj });
  const total = await countUsers(filter);

  return {
    data: users.map(shapeUser),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

export const createUserAsAdmin = async ({ name, email, password, role }) => {
  if (!name || !email || !password) throw new AppError("Missing fields", 400);
  if (role && !ROLE_PERMISSIONS[role]) throw new AppError("Invalid role", 400);

  const exists = await findByEmail(email);
  if (exists) throw new AppError("Email already used", 409);

  const user = await createUser({ name, email, password, role });
  return shapeUser(user);
};

export const updateUserByAdmin = async (userId, { name, email, password, role }) => {
  ensureValidId(userId);
  const user = await findById(userId);
  if (!user) throw new AppError("User not found", 404);

  if (email && email !== user.email) {
    const exists = await findByEmail(email);
    if (exists && exists._id.toString() !== userId) {
      throw new AppError("Email already used", 409);
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (password) user.password = password; // will hash on save
  if (role) {
    if (!ROLE_PERMISSIONS[role]) throw new AppError("Invalid role", 400);
    user.role = role;
  }

  await user.save();
  return shapeUser(user);
};

export const deleteUserByAdmin = async (userId) => {
  ensureValidId(userId);
  await deleteUserById(userId);
  return true;
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