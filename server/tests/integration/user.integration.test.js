import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

// Mock mailer to avoid real SMTP
const sendMail = jest.fn().mockResolvedValue(true);
jest.unstable_mockModule("../../src/utils/mailer.js", () => ({ sendMail }));

// Import app after mocks
const { default: app } = await import("../../src/server.js");
import { User } from "../../src/models/User.js";

let mongoServer;
let adminToken;
let adminId;

const jwtSecret = process.env.JWT_SECRET || "testsecret";
process.env.NODE_ENV = "test";

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create admin user
  const admin = await User.create({
    name: "Admin",
    email: "admin@test.com",
    password: "secret123",
    role: "admin",
  });
  adminId = admin._id;
  adminToken = jwt.sign(
    { userId: adminId.toString(), role: "admin" },
    jwtSecret,
    { expiresIn: "1h" }
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Keep admin; clear others
  await User.deleteMany({ _id: { $ne: adminId } });
  sendMail.mockClear();
});

describe("User Management Integration", () => {
  // Registers and logs in a user, returns token and user
  it("registers and logs in a user, returns token and user", async () => {
    const email = `user${Date.now()}@test.com`;

    const reg = await request(app)
      .post("/api/auth/register")
      .send({ name: "User One", email, password: "pass123", role: "user" });
    expect(reg.statusCode).toBe(201);
    expect(reg.body.user.email).toBe(email);
    expect(reg.body.token).toBeTruthy();

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "pass123" });
    expect(login.statusCode).toBe(200);
    expect(login.body.token).toBeTruthy();
  });

  // Returns current user details via /users/me
  it("returns current user details via /users/me", async () => {
    const email = `me${Date.now()}@test.com`;
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ name: "Me User", email, password: "pass123", role: "user" });
    const token = reg.body.token;

    const me = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(me.statusCode).toBe(200);
    expect(me.body.email).toBe(email);
  });

  // Updates current user name via /users/me
  it("updates current user name via /users/me", async () => {
    const email = `upd${Date.now()}@test.com`;
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ name: "Old Name", email, password: "pass123", role: "user" });
    const token = reg.body.token;

    const upd = await request(app)
      .put("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Name" });

    expect(upd.statusCode).toBe(200);
    expect(upd.body.name).toBe("New Name");
  });

  // Lists users with admin token
  it("lists users with admin token", async () => {
    // create another user
    await request(app)
      .post("/api/auth/register")
      .send({ name: "List User", email: `list${Date.now()}@test.com`, password: "pass123", role: "user" });

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  // Gets user details by id (admin)
  it("gets user details by id (admin)", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ name: "Detail User", email: `detail${Date.now()}@test.com`, password: "pass123", role: "user" });

    const userId = reg.body.user.id;

    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id || res.body.id).toBe(userId);
  });

  // Deletes current user via /users/me
  it("deletes current user via /users/me", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ name: "Del User", email: `del${Date.now()}@test.com`, password: "pass123", role: "user" });
    const token = reg.body.token;

    const del = await request(app)
      .delete("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(del.statusCode).toBe(200);
    expect(del.body.ok).toBe(true);

    const u = await User.findOne({ email: `del${Date.now()}@test.com` });
    expect(u).toBeNull();
  });

  // Forgot password triggers mail send
  it("forgot password triggers mail send", async () => {
    const email = `fp${Date.now()}@test.com`;
    await request(app)
      .post("/api/auth/register")
      .send({ name: "FP User", email, password: "pass123", role: "user" });

    const res = await request(app)
      .post("/api/auth/forgot")
      .send({ email });

    expect(res.statusCode).toBe(200);
    expect(sendMail).toHaveBeenCalled();
  });

  // Resets password with valid OTP token preset
  it("resets password with valid OTP token preset", async () => {
    const email = `rp${Date.now()}@test.com`;
    const user = await User.create({
      name: "RP User",
      email,
      password: "oldpass",
      role: "user",
    });

    // preset OTP hash for known code "123456"
    const crypto = await import("crypto");
    user.resetPasswordToken = crypto.createHash("sha256").update("123456").digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const res = await request(app)
      .post("/api/auth/reset")
      .send({ email, otp: "123456", newPassword: "newpass" });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);

    // login with new password
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "newpass" });

    expect(login.statusCode).toBe(200);
    expect(login.body.token).toBeTruthy();
  });
});