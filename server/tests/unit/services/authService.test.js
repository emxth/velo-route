import { jest } from "@jest/globals";

const findByEmail = jest.fn();
const createUser = jest.fn();
const generateToken = jest.fn();

jest.unstable_mockModule("../../../src/repositories/userRepository.js", () => ({
  findByEmail,
  createUser,
}));
jest.unstable_mockModule("../../../src/utils/generateToken.js", () => ({
  generateToken,
}));

const { registerUser, loginUser } = await import("../../../src/services/authService.js");
const { AppError } = await import("../../../src/utils/AppError.js");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("registerUser fails on missing fields", async () => {
    await expect(registerUser({})).rejects.toThrow(AppError);
  });

  test("registerUser rejects duplicate email", async () => {
    findByEmail.mockResolvedValue({ id: "1" });
    await expect(
      registerUser({ name: "A", email: "a@test.com", password: "pw" })
    ).rejects.toThrow("Email already used");
  });

  test("registerUser creates user and returns token/user", async () => {
    findByEmail.mockResolvedValue(null);
    createUser.mockResolvedValue({ _id: "123", name: "A", email: "a@test.com", role: "user" });
    generateToken.mockReturnValue("jwt");
    const res = await registerUser({ name: "A", email: "a@test.com", password: "pw" });
    expect(res.token).toBe("jwt");
    expect(res.user).toMatchObject({ id: "123", email: "a@test.com", role: "user" });
  });

  test("loginUser rejects invalid credentials", async () => {
    findByEmail.mockResolvedValue(null);
    await expect(loginUser({ email: "x", password: "pw" })).rejects.toThrow("Invalid credentials");
  });

  test("loginUser succeeds", async () => {
    const mockUser = {
      _id: "u1",
      name: "A",
      email: "a@test.com",
      role: "user",
      matchPassword: jest.fn().mockResolvedValue(true),
    };
    findByEmail.mockResolvedValue(mockUser);
    generateToken.mockReturnValue("jwt");
    const res = await loginUser({ email: "a@test.com", password: "pw" });
    expect(res.user).toMatchObject({ id: "u1", email: "a@test.com" });
  });
});
