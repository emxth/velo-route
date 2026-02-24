import Vehicle from "../models/Vehicle.js";

/*
Repository Layer
ONLY database access logic
*/

export const create = (data) => Vehicle.create(data);

export const findById = (id) =>
  Vehicle.findById(id)
    .populate("departmentDetails")
    .populate("creator updater", "name email role");

export const findAll = (filter = {}, skip = 0, limit = 10) => {
  return Vehicle.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("departmentDetails")
    .populate("creator updater", "name email role");
};

// ADD countDocuments
export const countDocuments = (filter = {}) => {
  return Vehicle.countDocuments(filter);
};

export const updateById = (id, data) =>
  Vehicle.findByIdAndUpdate(
    id,
    { ...data, updatedAt: new Date() },
    { new: true, runValidators: true },
  )
    .populate("departmentDetails")
    .populate("creator updater", "name email role");

export const deleteById = (id) => Vehicle.findByIdAndDelete(id);

export const findByRegistrationNumber = (registrationNumber) =>
  Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase() });
