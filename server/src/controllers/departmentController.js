import * as departmentService from "../services/departmentService.js";
import logger from "../config/logger.js";

//Controller layer handles HTTP requests

export const createDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.createDepartment(
      req.user._id,
      req.body,
    );
    res.status(201).json(department);
  } catch (err) {
    next(err);
  }
};

export const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await departmentService.getAllDepartments();
    res.json(departments);
  } catch (err) {
    next(err);
  }
};

export const getDepartment = async (req, res, next) => {
  try {
    const departments = await departmentService.getDepartmentById(
      req.params.id,
    );
    res.json(departments);
  } catch (err) {
    next(err);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.updateDepartment(
      req.params.id,
      req.user._id,
      req.body,
    );
    res.json(department);
  } catch (err) {
    next(err);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const result = await departmentService.deleteDepartment(
      req.params.id,
      req.user._id,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};
