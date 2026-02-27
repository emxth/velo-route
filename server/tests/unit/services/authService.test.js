import { jest } from "@jest/globals";
import crypto from "crypto";

const findByEmail = jest.fn();
const createUser = jest.fn();
const updateUserById = jest.fn();
const sendMail = jest.fn();
const generateToken = jest.fn();

jest.unstable_mockModule("../../../src/repositories/userRepository.js", () => ({
  findByEmail,
  createUser,
  updateUserById,
}));
jest.unstable_mockModule("../../../src/utils/generateToken.js", () => ({
  generateToken,
}));
jest.unstable_mockModule("../../../src/utils/mailer.js", () => ({
  sendMail,
}));

const {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPasswordWithOtp,
} = await import("../../../src/services/authService.js");
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

  // --- Password reset (new) ---

  test("requestPasswordReset requires email", async () => {
    await expect(requestPasswordReset(null)).rejects.toThrow("Email required");
  });

  test("requestPasswordReset fails when user not found", async () => {
    findByEmail.mockResolvedValue(null);
    await expect(requestPasswordReset("no@test.com")).rejects.toThrow("User not found");
  });

  test("requestPasswordReset stores hashed token and sends mail", async () => {
    const user = { _id: "u1", email: "a@test.com" };
    findByEmail.mockResolvedValue(user);
    updateUserById.mockResolvedValue({});
    sendMail.mockResolvedValue({});
    await requestPasswordReset(user.email);
    expect(updateUserById).toHaveBeenCalledWith(
      user._id,
      expect.objectContaining({
        resetPasswordToken: expect.any(String),
        resetPasswordExpires: expect.any(Date),
      })
    );
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: user.email, subject: expect.any(String) })
    );
  });

  test("resetPasswordWithOtp requires all fields", async () => {
    await expect(resetPasswordWithOtp({})).rejects.toThrow("Missing fields");
  });

  test("resetPasswordWithOtp fails if no reset requested", async () => {
    const user = { email: "a@test.com" };
    findByEmail.mockResolvedValue(user);
    await expect(
      resetPasswordWithOtp({ email: user.email, otp: "123456", newPassword: "pw" })
    ).rejects.toThrow("No reset requested");
  });

  test("resetPasswordWithOtp fails if expired", async () => {
    const user = {
      email: "a@test.com",
      resetPasswordToken: "tok",
      resetPasswordExpires: new Date(Date.now() - 1000),
    };
    findByEmail.mockResolvedValue(user);
    await expect(
      resetPasswordWithOtp({ email: user.email, otp: "123456", newPassword: "pw" })
    ).rejects.toThrow("Reset code expired");
  });

  test("resetPasswordWithOtp fails on invalid code", async () => {
    const user = {
      email: "a@test.com",
      resetPasswordToken: crypto.createHash("sha256").update("999999").digest("hex"),
      resetPasswordExpires: new Date(Date.now() + 60000),
    };
    findByEmail.mockResolvedValue(user);
    await expect(
      resetPasswordWithOtp({ email: user.email, otp: "123456", newPassword: "pw" })
    ).rejects.toThrow("Invalid code");
  });

  test("resetPasswordWithOtp succeeds", async () => {
    const otp = "123456";
    const user = {
      email: "a@test.com",
      resetPasswordToken: crypto.createHash("sha256").update(otp).digest("hex"),
      resetPasswordExpires: new Date(Date.now() + 60000),
      save: jest.fn().mockResolvedValue(true),
    };
    findByEmail.mockResolvedValue(user);
    const res = await resetPasswordWithOtp({
      email: user.email,
      otp,
      newPassword: "newpw",
    });
    expect(res).toEqual({ ok: true });
    expect(user.password).toBe("newpw");
    expect(user.save).toHaveBeenCalled();
  });
});