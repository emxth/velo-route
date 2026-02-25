import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import * as departmentController from "../controllers/departmentController.js";
import { validateDepartment } from "../middleware/departmentValidation.js";
import asyncHandler from "express-async-handler";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin creates, view all, view one, update and delete departments
router.post(
  "/",
  authorize("admin"),
  validateDepartment,
  asyncHandler(departmentController.createDepartment),
);

router.get(
  "/",
  authorize("admin"),
  asyncHandler(departmentController.getAllDepartments),
);

router.get(
  "/:id",
  authorize("admin"),
  asyncHandler(departmentController.getDepartment),
);

router.put(
  "/:id",
  authorize("admin"),
  validateDepartment,
  asyncHandler(departmentController.updateDepartment),
);

router.delete(
  "/:id",
  authorize("admin"),
  asyncHandler(departmentController.deleteDepartment),
);

export default router;
