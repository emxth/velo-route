import { jest } from "@jest/globals";
import mongoose from "mongoose";

// ==========================================
// MOCK DEPENDENCIES
// ==========================================
const createMock = jest.fn();
const findByIdMock = jest.fn();
const findAllMock = jest.fn();
const countDocumentsMock = jest.fn();
const updateByIdMock = jest.fn();
const deleteByIdMock = jest.fn();

jest.unstable_mockModule(
  "../../../src/repositories/departmentRepository.js",
  () => ({
    create: createMock,
    findById: findByIdMock,
    findAll: findAllMock,
    countDocuments: countDocumentsMock,
    updateById: updateByIdMock,
    deleteById: deleteByIdMock,
  }),
);

const { AppError } = await import("../../../src/utils/AppError.js");
const {
  createDepartment,
  getDepartmentById,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
} = await import("../../../src/services/departmentService.js");

describe("Department Service Unit Tests", () => {
  const validObjectId = new mongoose.Types.ObjectId().toString();
  const adminId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // CREATE DEPARTMENT - Core Tests
  // ==========================================
  describe("createDepartment", () => {
    const validData = {
      name: "Transport Department",
      managerName: "John Doe",
      contactNumber: "0771234567",
      email: "transport@example.com",
      address: "123 Main Street, Colombo",
      region: "Western",
    };

    test("should create department successfully", async () => {
      const mockCreated = {
        _id: validObjectId,
        ...validData,
        createdBy: adminId,
      };
      createMock.mockResolvedValue(mockCreated);

      const result = await createDepartment(adminId, validData);

      expect(createMock).toHaveBeenCalledWith({
        ...validData,
        createdBy: adminId,
      });
      expect(result).toEqual(mockCreated);
    });

    test("should throw error if required fields are missing", async () => {
      const incompleteData = { name: "Transport Department" };

      await expect(createDepartment(adminId, incompleteData)).rejects.toThrow(
        new AppError("Missing required fields", 400),
      );
      expect(createMock).not.toHaveBeenCalled();
    });

    test("should throw error if creation fails", async () => {
      createMock.mockResolvedValue(null);

      await expect(createDepartment(adminId, validData)).rejects.toThrow(
        new AppError("Failed to create department", 500),
      );
    });
  });

  // ==========================================
  // GET DEPARTMENT BY ID - Core Tests
  // ==========================================
  describe("getDepartmentById", () => {
    test("should return department when found", async () => {
      const mockDepartment = {
        _id: validObjectId,
        name: "Transport Department",
      };
      findByIdMock.mockResolvedValue(mockDepartment);

      const result = await getDepartmentById(validObjectId);

      expect(findByIdMock).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(mockDepartment);
    });

    test("should throw error if ID format is invalid", async () => {
      await expect(getDepartmentById("invalid-id")).rejects.toThrow(
        new AppError("Invalid department ID format", 400),
      );
      expect(findByIdMock).not.toHaveBeenCalled();
    });

    test("should throw error if department not found", async () => {
      findByIdMock.mockResolvedValue(null);

      await expect(getDepartmentById(validObjectId)).rejects.toThrow(
        new AppError("Department not found", 404),
      );
    });
  });

  // ==========================================
  // GET ALL DEPARTMENTS - Core Tests
  // ==========================================
  describe("getAllDepartments", () => {
    test("should return paginated departments", async () => {
      const mockDepartments = [
        { _id: "1", name: "Dept 1" },
        { _id: "2", name: "Dept 2" },
      ];
      findAllMock.mockResolvedValue(mockDepartments);
      countDocumentsMock.mockResolvedValue(15);

      const result = await getAllDepartments(2, 5);

      expect(findAllMock).toHaveBeenCalledWith({}, 5, 5);
      expect(result).toEqual({
        data: mockDepartments,
        pagination: {
          page: 2,
          limit: 5,
          total: 15,
          pages: 3,
        },
      });
    });

    test("should handle empty result set", async () => {
      findAllMock.mockResolvedValue([]);
      countDocumentsMock.mockResolvedValue(0);

      const result = await getAllDepartments();

      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      });
    });
  });

  // ==========================================
  // UPDATE DEPARTMENT - Core Tests
  // ==========================================
  describe("updateDepartment", () => {
    const updateData = { name: "Updated Name" };

    test("should update department successfully", async () => {
      const existingDepartment = { _id: validObjectId };
      const updatedDepartment = {
        _id: validObjectId,
        ...updateData,
        updatedBy: adminId,
      };

      findByIdMock.mockResolvedValue(existingDepartment);
      updateByIdMock.mockResolvedValue(updatedDepartment);

      const result = await updateDepartment(validObjectId, adminId, updateData);

      expect(findByIdMock).toHaveBeenCalledWith(validObjectId);
      expect(updateByIdMock).toHaveBeenCalledWith(validObjectId, {
        ...updateData,
        updatedBy: adminId,
      });
      expect(result).toEqual(updatedDepartment);
    });

    test("should throw error if department not found", async () => {
      findByIdMock.mockResolvedValue(null);

      await expect(
        updateDepartment(validObjectId, adminId, updateData),
      ).rejects.toThrow(new AppError("Department not found", 404));
    });
  });

  // ==========================================
  // DELETE DEPARTMENT - Core Tests
  // ==========================================
  describe("deleteDepartment", () => {
    test("should delete department successfully", async () => {
      const existingDepartment = { _id: validObjectId };
      findByIdMock.mockResolvedValue(existingDepartment);
      deleteByIdMock.mockResolvedValue(true);

      const result = await deleteDepartment(validObjectId);

      expect(findByIdMock).toHaveBeenCalledWith(validObjectId);
      expect(deleteByIdMock).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual({ message: "Department deleted successfully" });
    });

    test("should throw error if department not found", async () => {
      findByIdMock.mockResolvedValue(null);

      await expect(deleteDepartment(validObjectId)).rejects.toThrow(
        new AppError("Department not found", 404),
      );
    });
  });
});
