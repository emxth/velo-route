import { AppError } from "../utils/AppError.js";
import * as vehicleRepo from "../repositories/vehicleRepository.js";
import * as departmentRepo from "../repositories/departmentRepository.js";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createVehicle = async (adminId, data, file) => {
  // Database existence checks (can't be done in middleware)
  if (!isValidObjectId(data.department)) {
    throw new AppError("Invalid department ID format", 400);
  }

  const department = await departmentRepo.findById(data.department);
  if (!department) {
    throw new AppError("Department not found", 404);
  }

  // Uniqueness check (requires database query)
  const existingVehicle = await vehicleRepo.findByRegistrationNumber(
    data.registrationNumber,
  );
  if (existingVehicle) {
    throw new AppError(
      "Vehicle with this registration number already exists",
      400,
    );
  }

  // File handling
  let vehiclePhoto = "";
  let cloudinaryId = "";
  if (file) {
    vehiclePhoto = file.path;
    cloudinaryId = file.filename;
  }

  const vehicle = await vehicleRepo.create({
    ...data,
    vehiclePhoto,
    cloudinaryId,
    createdBy: adminId,
  });

  if (!vehicle) {
    throw new AppError("Failed to create vehicle", 500);
  }

  return vehicle;
};

export const getVehicleById = async (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid vehicle ID format", 400);
  }

  const vehicle = await vehicleRepo.findById(id);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  return vehicle;
};

export const getAllVehicles = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const vehicles = await vehicleRepo.findAll({}, skip, limit);
  const total = await vehicleRepo.countDocuments();

  return {
    data: vehicles,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const updateVehicle = async (id, adminId, data, file) => {
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid vehicle ID format", 400);
  }

  const existing = await vehicleRepo.findById(id);
  if (!existing) {
    throw new AppError("Vehicle not found", 404);
  }

  // Department existence check if being updated
  if (data.department) {
    if (!isValidObjectId(data.department)) {
      throw new AppError("Invalid department ID format", 400);
    }
    const department = await departmentRepo.findById(data.department);
    if (!department) {
      throw new AppError("Department not found", 404);
    }
  }

  // Registration number uniqueness check if being updated
  if (
    data.registrationNumber &&
    data.registrationNumber !== existing.registrationNumber
  ) {
    const vehicleWithReg = await vehicleRepo.findByRegistrationNumber(
      data.registrationNumber,
    );
    if (vehicleWithReg) {
      throw new AppError(
        "Vehicle with this registration number already exists",
        400,
      );
    }
  }

  // Image update handling
  let updateData = { ...data, updatedBy: adminId };
  if (file) {
    if (existing.cloudinaryId) {
      await cloudinary.uploader.destroy(existing.cloudinaryId);
    }
    updateData.vehiclePhoto = file.path;
    updateData.cloudinaryId = file.filename;
  }

  const updated = await vehicleRepo.updateById(id, updateData);
  return updated;
};

export const deleteVehicle = async (id, adminId) => {
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid vehicle ID format", 400);
  }

  const existing = await vehicleRepo.findById(id);
  if (!existing) {
    throw new AppError("Vehicle not found", 404);
  }

  if (existing.cloudinaryId) {
    await cloudinary.uploader.destroy(existing.cloudinaryId);
  }

  await vehicleRepo.deleteById(id);
  return { message: "Vehicle deleted successfully" };
};
