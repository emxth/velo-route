import { jest } from "@jest/globals";
import mongoose from "mongoose";

// Mock dependencies
const createMock = jest.fn();
const findByIdMock = jest.fn();
const findAllMock = jest.fn();
const countDocumentsMock = jest.fn();
const updateByIdMock = jest.fn();
const deleteByIdMock = jest.fn();
const findByRegistrationNumberMock = jest.fn();
const findDepartmentByIdMock = jest.fn();
const cloudinaryDestroyMock = jest.fn();

jest.unstable_mockModule(
  "../../../src/repositories/vehicleRepository.js",
  () => ({
    create: createMock,
    findById: findByIdMock,
    findAll: findAllMock,
    countDocuments: countDocumentsMock,
    updateById: updateByIdMock,
    deleteById: deleteByIdMock,
    findByRegistrationNumber: findByRegistrationNumberMock,
  }),
);

jest.unstable_mockModule(
  "../../../src/repositories/departmentRepository.js",
  () => ({
    findById: findDepartmentByIdMock,
  }),
);

jest.unstable_mockModule("../../../src/config/cloudinary.js", () => ({
  default: { uploader: { destroy: cloudinaryDestroyMock } },
}));

const { AppError } = await import("../../../src/utils/AppError.js");
const {
  createVehicle,
  getVehicleById,
  getAllVehicles,
  updateVehicle,
  deleteVehicle,
} = await import("../../../src/services/vehicleService.js");

describe("Vehicle Service Unit Tests", () => {
  const validVehicleId = new mongoose.Types.ObjectId().toString();
  const validDepartmentId = new mongoose.Types.ObjectId().toString();
  const adminId = new mongoose.Types.ObjectId().toString();

  const mockFile = {
    path: "https://cloudinary.com/image.jpg",
    filename: "cloudinary-id-123",
  };

  const validVehicleData = {
    registrationNumber: "ABC-1234",
    category: "Bus",
    type: "Passenger",
    brand: "Toyota",
    model: "Coaster",
    yearOfManufacture: 2022,
    seatCapacity: 30,
    department: validDepartmentId,
    insurance: {
      provider: "ABC Insurance",
      policyNumber: "POL123",
      startDate: "2024-01-01",
      expiryDate: "2025-01-01",
    },
    fitness: {
      certificateNumber: "FIT123",
      issueDate: "2024-01-01",
      expiryDate: "2025-01-01",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // CREATE VEHICLE
  // ==========================================
  describe("createVehicle", () => {
    test("should create vehicle successfully with photo", async () => {
      findDepartmentByIdMock.mockResolvedValue({ _id: validDepartmentId });
      findByRegistrationNumberMock.mockResolvedValue(null);
      createMock.mockResolvedValue({
        _id: validVehicleId,
        ...validVehicleData,
        vehiclePhoto: mockFile.path,
        cloudinaryId: mockFile.filename,
        createdBy: adminId,
      });

      const result = await createVehicle(adminId, validVehicleData, mockFile);

      expect(createMock).toHaveBeenCalled();
      expect(result._id).toBe(validVehicleId);
    });

    test("should create vehicle successfully without photo", async () => {
      findDepartmentByIdMock.mockResolvedValue({ _id: validDepartmentId });
      findByRegistrationNumberMock.mockResolvedValue(null);
      createMock.mockResolvedValue({
        _id: validVehicleId,
        ...validVehicleData,
        createdBy: adminId,
      });

      const result = await createVehicle(adminId, validVehicleData, null);

      expect(createMock).toHaveBeenCalled();
      expect(result._id).toBe(validVehicleId);
    });

    test("should throw error if department not found", async () => {
      findDepartmentByIdMock.mockResolvedValue(null);

      await expect(
        createVehicle(adminId, validVehicleData, mockFile),
      ).rejects.toThrow(AppError);
      expect(createMock).not.toHaveBeenCalled();
    });

    test("should throw error if registration number already exists", async () => {
      findDepartmentByIdMock.mockResolvedValue({ _id: validDepartmentId });
      findByRegistrationNumberMock.mockResolvedValue({ _id: "existing" });

      await expect(
        createVehicle(adminId, validVehicleData, mockFile),
      ).rejects.toThrow(AppError);
      expect(createMock).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // GET VEHICLE BY ID
  // ==========================================
  describe("getVehicleById", () => {
    test("should return vehicle when found", async () => {
      const mockVehicle = {
        _id: validVehicleId,
        registrationNumber: "ABC-1234",
      };
      findByIdMock.mockResolvedValue(mockVehicle);

      const result = await getVehicleById(validVehicleId);

      expect(findByIdMock).toHaveBeenCalledWith(validVehicleId);
      expect(result).toEqual(mockVehicle);
    });

    test("should throw error if ID format is invalid", async () => {
      await expect(getVehicleById("invalid-id")).rejects.toThrow(AppError);
      expect(findByIdMock).not.toHaveBeenCalled();
    });

    test("should throw error if vehicle not found", async () => {
      findByIdMock.mockResolvedValue(null);

      await expect(getVehicleById(validVehicleId)).rejects.toThrow(AppError);
    });
  });

  // ==========================================
  // GET ALL VEHICLES
  // ==========================================
  describe("getAllVehicles", () => {
    test("should return paginated vehicles", async () => {
      const mockVehicles = [
        { _id: "1", registrationNumber: "ABC-123" },
        { _id: "2", registrationNumber: "DEF-456" },
      ];
      findAllMock.mockResolvedValue(mockVehicles);
      countDocumentsMock.mockResolvedValue(25);

      const result = await getAllVehicles(2, 10);

      expect(findAllMock).toHaveBeenCalled();
      expect(result.data).toEqual(mockVehicles);
      expect(result.pagination.page).toBe(2);
    });

    test("should handle empty result set", async () => {
      findAllMock.mockResolvedValue([]);
      countDocumentsMock.mockResolvedValue(0);

      const result = await getAllVehicles();

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  // ==========================================
  // UPDATE VEHICLE
  // ==========================================
  describe("updateVehicle", () => {
    const existingVehicle = {
      _id: validVehicleId,
      registrationNumber: "ABC-1234",
      cloudinaryId: "old-cloudinary-id",
    };

    test("should update vehicle successfully", async () => {
      findByIdMock.mockResolvedValue(existingVehicle);
      updateByIdMock.mockResolvedValue({
        ...existingVehicle,
        brand: "Updated Brand",
        updatedBy: adminId,
      });

      const result = await updateVehicle(
        validVehicleId,
        adminId,
        { brand: "Updated Brand" },
        null,
      );

      expect(updateByIdMock).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    test("should update vehicle with new photo", async () => {
      findByIdMock.mockResolvedValue(existingVehicle);
      updateByIdMock.mockResolvedValue({
        ...existingVehicle,
        vehiclePhoto: mockFile.path,
        cloudinaryId: mockFile.filename,
      });

      const result = await updateVehicle(validVehicleId, adminId, {}, mockFile);

      expect(cloudinaryDestroyMock).toHaveBeenCalledWith("old-cloudinary-id");
      expect(updateByIdMock).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    test("should throw error if vehicle not found", async () => {
      findByIdMock.mockResolvedValue(null);

      await expect(
        updateVehicle(validVehicleId, adminId, {}, null),
      ).rejects.toThrow(AppError);
      expect(updateByIdMock).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // DELETE VEHICLE
  // ==========================================
  describe("deleteVehicle", () => {
    test("should delete vehicle successfully", async () => {
      const existingVehicle = {
        _id: validVehicleId,
        cloudinaryId: "cloudinary-id",
      };

      findByIdMock.mockResolvedValue(existingVehicle);
      deleteByIdMock.mockResolvedValue(true);

      const result = await deleteVehicle(validVehicleId, adminId);

      expect(cloudinaryDestroyMock).toHaveBeenCalledWith("cloudinary-id");
      expect(deleteByIdMock).toHaveBeenCalledWith(validVehicleId);
      expect(result).toEqual({ message: "Vehicle deleted successfully" });
    });

    test("should delete vehicle without cloudinary image", async () => {
      const existingVehicle = { _id: validVehicleId, cloudinaryId: null };

      findByIdMock.mockResolvedValue(existingVehicle);
      deleteByIdMock.mockResolvedValue(true);

      const result = await deleteVehicle(validVehicleId, adminId);

      expect(cloudinaryDestroyMock).not.toHaveBeenCalled();
      expect(result).toEqual({ message: "Vehicle deleted successfully" });
    });

    test("should throw error if vehicle not found", async () => {
      findByIdMock.mockResolvedValue(null);

      await expect(deleteVehicle(validVehicleId, adminId)).rejects.toThrow(
        AppError,
      );
      expect(deleteByIdMock).not.toHaveBeenCalled();
    });
  });
});
