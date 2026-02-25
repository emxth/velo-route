import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import * as vehicleController from "../controllers/vehicleController.js";
import { validateVehicle } from "../middleware/vehicleValidation.js";
import { uploadVehicleImage } from "../middleware/uploadVehicleImage.js";
import asyncHandler from "express-async-handler";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin creates, view all, view one, update and delete vehicles
router.post(
  "/",
  authorize("admin"),
  uploadVehicleImage,
  validateVehicle,
  asyncHandler(vehicleController.createVehicle),
);

router.get(
  "/",
  authorize("admin"),
  asyncHandler(vehicleController.getAllVehicles),
);

router.get(
  "/:id",
  authorize("admin"),
  asyncHandler(vehicleController.getVehicle),
);

router.put(
  "/:id",
  authorize("admin"),
  uploadVehicleImage,
  validateVehicle,
  asyncHandler(vehicleController.updateVehicle),
);

router.delete(
  "/:id",
  authorize("admin"),
  asyncHandler(vehicleController.deleteVehicle),
);

export default router;
