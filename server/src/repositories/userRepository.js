import { User } from "../models/User.js";

export const findByEmail = (email) => User.findOne({ email });
export const findById = (id, projection) => User.findById(id).select(projection);
export const createUser = (payload) => User.create(payload);
export const updateUserById = (id, update) =>
  User.findByIdAndUpdate(id, update, { new: true });
export const deleteUserById = (id) => User.findByIdAndDelete(id);
export const listUsers = () => User.find().select("name email role");