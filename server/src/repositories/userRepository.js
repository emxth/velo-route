import { User } from "../models/User.js";

export const findByEmail = (email) => User.findOne({ email });
export const findById = (id, projection) => User.findById(id).select(projection);
export const createUser = (payload) => User.create(payload);
export const updateUserById = (id, update) =>
  User.findByIdAndUpdate(id, update, { new: true });
export const deleteUserById = (id) => User.findByIdAndDelete(id);

export const listUsers = ({ filter = {}, skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) =>
  User.find(filter)
    .select("name email role createdAt")
    .sort(sort)
    .skip(skip)
    .limit(limit);

export const countUsers = (filter = {}) => User.countDocuments(filter);