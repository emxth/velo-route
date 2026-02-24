import * as vehicleService from "../services/vehicleService.js";
import logger from "../config/logger.js";

//Controller layer handles HTTP requests

export const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.createVehicle(
      req.user._id,
      req.body,
      req.file,
    );
    res.status(201).json(vehicle);
  } catch (err) {
    logger.error(`Create vehicle failed: ${err.message}`, {
      userId: req.user?._id,
      registrationNumber: req.body?.registrationNumber,
    });
    next(err);
  }
};

export const getAllVehicles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await vehicleService.getAllVehicles(page, limit);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    logger.error(`Get all vehicles failed: ${err.message}`);
    next(err);
  }
};

export const getVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    res.json(vehicle);
  } catch (err) {
    logger.error(`Get vehicle ${req.params.id} failed: ${err.message}`, {
      userId: req.user?._id,
    });
    next(err);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(
      req.params.id,
      req.user._id,
      req.body,
      req.file,
    );
    res.json(vehicle);
  } catch (err) {
    logger.error(`Update vehicle ${req.params.id} failed: ${err.message}`, {
      userId: req.user?._id,
      registrationNumber: req.body?.registrationNumber,
    });
    next(err);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const result = await vehicleService.deleteVehicle(
      req.params.id,
      req.user._id,
    );
    // warn for delete
    logger.warn(`Vehicle deleted: ${req.params.id}`, {
      deletedBy: req.user?.email,
    });
    res.json(result);
  } catch (err) {
    logger.error(`Delete vehicle ${req.params.id} failed: ${err.message}`, {
      userId: req.user?._id,
    });
    next(err);
  }
};
