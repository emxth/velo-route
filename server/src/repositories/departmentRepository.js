import Department from "../models/Department.js";

/*
Repository Layer
ONLY database access logic
*/

export const create = (data) => Department.create(data);

export const findById = (id) =>
  Department.findById(id).populate("creator updater", "name email role");

<<<<<<< Updated upstream
export const findAll = (filter = {}) =>
  Department.find(filter)
    .sort({ createdAt: -1 })
    .populate("creator updater", "name email role");
=======
export const findAll = (filter = {}, skip = 0, limit = 10) => {
  return Department.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("creator updater", "name email role");
};

// ADD countDocuments
export const countDocuments = (filter = {}) => {
  return Department.countDocuments(filter);
};
>>>>>>> Stashed changes

export const updateById = (id, data) =>
  Department.findByIdAndUpdate(
    id,
    { ...data, updatedAt: new Date() },
    { new: true, runValidators: true },
  ).populate("creator updater", "name email role");

export const deleteById = (id) => Department.findByIdAndDelete(id);
