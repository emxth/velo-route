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
<<<<<<< Updated upstream
=======
    logger.error(`Create department failed: ${err.message}`, {
      userId: req.user?._id,
      email: req.user?.email,
    });
>>>>>>> Stashed changes
    next(err);
  }
};

export const getAllDepartments = async (req, res, next) => {
  try {
<<<<<<< Updated upstream
    const departments = await departmentService.getAllDepartments();
    res.json(departments);
  } catch (err) {
=======
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await departmentService.getAllDepartments(page, limit);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    logger.error(`Get all departments failed: ${err.message}`);
>>>>>>> Stashed changes
    next(err);
  }
};

export const getDepartment = async (req, res, next) => {
  try {
<<<<<<< Updated upstream
    const departments = await departmentService.getDepartmentById(
      req.params.id,
    );
    res.json(departments);
  } catch (err) {
=======
    const department = await departmentService.getDepartmentById(req.params.id);
    res.json(department);
  } catch (err) {
    logger.error(`Get department ${req.params.id} failed: ${err.message}`, {
      userId: req.user?._id,
    });
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
    logger.error(`Update department ${req.params.id} failed: ${err.message}`, {
      userId: req.user?._id,
      email: req.user?.email,
    });
>>>>>>> Stashed changes
    next(err);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const result = await departmentService.deleteDepartment(
      req.params.id,
      req.user._id,
    );
<<<<<<< Updated upstream
    res.json(result);
  } catch (err) {
=======
    // warn for delete
    logger.warn(`Department deleted: ${req.params.id}`, {
      deletedBy: req.user?.email,
    });
    res.json(result);
  } catch (err) {
    logger.error(`Delete department ${req.params.id} failed: ${err.message}`, {
      userId: req.user?._id,
    });
>>>>>>> Stashed changes
    next(err);
  }
};
