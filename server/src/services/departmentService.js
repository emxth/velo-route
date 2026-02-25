import { AppError } from "../utils/AppError.js";
import * as departmentRepo from "../repositories/departmentRepository.js";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createDepartment = async (adminId, data) => {
  // Validation
  if (
    !data.name ||
    !data.managerName ||
    !data.contactNumber ||
    !data.email ||
    !data.address ||
    !data.region
  ) {
    throw new AppError("Missing required fields", 400);
  }

  const department = await departmentRepo.create({
    ...data,
    createdBy: adminId,
  });

  if (!department) {
    throw new AppError("Failed to create department", 500);
  }

  return department;
};

export const getDepartmentById = async (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid department ID format", 400);
  }

  const department = await departmentRepo.findById(id);
  if (!department) {
    throw new AppError("Department not found", 404);
  }

  return department;
};

export const getAllDepartments = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const departments = await departmentRepo.findAll({}, skip, limit);
  const total = await departmentRepo.countDocuments();

  return {
    data: departments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const updateDepartment = async (id, adminId, data) => {
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid department ID format", 400);
  }

  // Check if exists
  const existing = await departmentRepo.findById(id);
  if (!existing) {
    throw new AppError("Department not found", 404);
  }

  const updated = await departmentRepo.updateById(id, {
    ...data,
    updatedBy: adminId,
  });

  return updated;
};

export const deleteDepartment = async (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid department ID format", 400);
  }

  const existing = await departmentRepo.findById(id);
  if (!existing) {
    throw new AppError("Department not found", 404);
  }

  await departmentRepo.deleteById(id);
  return { message: "Department deleted successfully" };
};
