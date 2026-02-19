import Department from "../models/Department.js";

/*
Repository Layer
ONLY database access logic
*/

export const create = (data) => Department.create(data);

export const findById = (id) =>
  Department.findById(id).populate("creator updater", "name email role");

export const findAll = (filter = {}) =>
  Department.find(filter)
    .sort({ createdAt: -1 })
    .populate("creator updater", "name email role");

export const updateById = (id, data) =>
  Department.findByIdAndUpdate(
    id,
    { ...data, updatedAt: new Date() },
    { new: true, runValidators: true },
  ).populate("creator updater", "name email role");

export const deleteById = (id) => Department.findByIdAndDelete(id);
