import { jest } from "@jest/globals";
import mongoose from "mongoose";

const listUsersRepo = jest.fn();
const findById = jest.fn();
const updateUserById = jest.fn();
const deleteUserById = jest.fn();

jest.unstable_mockModule("../../../src/repositories/userRepository.js", () => ({
  listUsers: listUsersRepo,
  findById,
  updateUserById,
  deleteUserById,
}));

const {
  listUsers,
  getMyPermissions,
  getUserPermissions,
  updateUserRole,
  getCurrentUserDetails,
  deleteCurrentUser,
} = await import("../../../src/services/userService.js");
const { ROLE_PERMISSIONS } = await import("../../../src/config/rolePermissions.js");
const { AppError } = await import("../../../src/utils/AppError.js");

const oid = () => new mongoose.Types.ObjectId().toString();

describe("userService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("listUsers shapes users and derives nav", async () => {
    listUsersRepo.mockResolvedValue([
      { _id: "1", name: "Admin", email: "a@test.com", role: "admin" },
      { _id: "2", name: "User", email: "u@test.com", role: "user" },
    ]);
    const res = await listUsers();
    expect(res[0].allowedNav).toEqual(ROLE_PERMISSIONS.admin);
    expect(res[1].allowedNav).toEqual(ROLE_PERMISSIONS.user);
  });

  test("getUserPermissions validates id", async () => {
    await expect(getUserPermissions("bad-id")).rejects.toThrow(AppError);
  });

  test("updateUserRole rejects invalid role", async () => {
    const id = oid();
    await expect(updateUserRole(id, "nope")).rejects.toThrow("Invalid role");
  });

  test("updateUserRole updates role and derives nav", async () => {
    const id = oid();
    updateUserById.mockResolvedValue({ _id: id, name: "X", email: "x@test.com", role: "driver" });
    const res = await updateUserRole(id, "driver");
    expect(res.allowedNav).toEqual(ROLE_PERMISSIONS.driver);
  });

  test("getCurrentUserDetails returns shaped user", async () => {
    const id = oid();
    findById.mockResolvedValue({ _id: id, name: "Y", email: "y@test.com", role: "analyst" });
    const res = await getCurrentUserDetails(id);
    expect(res.allowedNav).toEqual(ROLE_PERMISSIONS.analyst);
  });

  test("deleteCurrentUser validates id", async () => {
    await expect(deleteCurrentUser("bad-id")).rejects.toThrow(AppError);
  });

  test("getMyPermissions derives from role", async () => {
    const res = await getMyPermissions({ role: "operator" });
    expect(res.allowedNav).toEqual(ROLE_PERMISSIONS.operator);
  });
});
