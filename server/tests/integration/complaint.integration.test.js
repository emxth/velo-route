import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import { User } from "../../src/models/User.js";
import { Complaint } from "../../src/models/Complaint.js";
import app from "../../src/server.js";

let mongoServer;
let adminToken;
let userToken;
let adminId;
let userId;

const jwtSecret = process.env.JWT_SECRET || "testsecret";
process.env.NODE_ENV = "test";

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // create admin and regular user
  const admin = await User.create({
    name: "Admin",
    email: "admin@test.com",
    password: "secret123",
    role: "admin",
  });
  const user = await User.create({
    name: "User",
    email: "user@test.com",
    password: "secret123",
    role: "user",
  });
  adminId = admin._id;
  userId = user._id;

  adminToken = jwt.sign(
    { userId: adminId.toString(), role: "admin" },
    jwtSecret,
    { expiresIn: "1h" }
  );
  userToken = jwt.sign(
    { userId: userId.toString(), role: "user" },
    jwtSecret,
    { expiresIn: "1h" }
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Complaint.deleteMany({});
});

describe("Complaint & Feedback Integration", () => {
  // Creates a complaint with location
  it("creates a complaint with location", async () => {
    const res = await request(app)
      .post("/api/complaints")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        category: "road",
        subject: "Pothole on main street",
        message: "Large pothole causing delays.",
        location: { lat: 7.8731, lng: 80.7718, label: "Near bridge" },
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.subject).toBe("Pothole on main street");
    expect(res.body.location).toMatchObject({ lat: 7.8731, lng: 80.7718, label: "Near bridge" });
    expect(res.body.user.toString ? res.body.user.toString() : res.body.user).toBe(userId.toString());
  });

  // Creates feedback
  it("creates feedback", async () => {
    const res = await request(app)
      .post("/api/complaints/feedback")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        category: "transport",
        subject: "Thanks for the new route",
        message: "Service is smoother now.",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.kind).toBe("feedback");
  });

  // Lists complaints as admin (sees all)
  it("lists complaints as admin (sees all)", async () => {
    // create one for user
    await Complaint.create({
      user: userId,
      kind: "complaint",
      category: "road",
      subject: "S1",
      message: "M1",
      status: "pending",
    });
    const res = await request(app)
      .get("/api/complaints")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  // Lists complaints as user (sees own only)
  it("lists complaints as user (sees own only)", async () => {
    const otherUser = await User.create({
      name: "Other",
      email: `o${Date.now()}@test.com`,
      password: "secret123",
      role: "user",
    });
    await Complaint.create([
      { user: userId, kind: "complaint", category: "road", subject: "Mine", message: "M", status: "pending" },
      { user: otherUser._id, kind: "complaint", category: "road", subject: "Theirs", message: "M", status: "pending" },
    ]);

    const res = await request(app)
      .get("/api/complaints")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.every((c) => (c.user._id || c.user).toString() === userId.toString())).toBe(true);
  });

  // Gets complaint by id (owner)
  it("gets complaint by id (owner)", async () => {
    const doc = await Complaint.create({
      user: userId,
      kind: "complaint",
      category: "road",
      subject: "Mine",
      message: "M",
      status: "pending",
    });

    const res = await request(app)
      .get(`/api/complaints/${doc._id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect((res.body.user._id || res.body.user).toString()).toBe(userId.toString());
  });

  // Returns 403 when non-owner non-admin tries to get complaint
  it("returns 403 when non-owner non-admin tries to get complaint", async () => {
    const otherUser = await User.create({
      name: "Other2",
      email: `o2${Date.now()}@test.com`,
      password: "secret123",
      role: "user",
    });
    const doc = await Complaint.create({
      user: otherUser._id,
      kind: "complaint",
      category: "road",
      subject: "Not mine",
      message: "M",
      status: "pending",
    });

    const res = await request(app)
      .get(`/api/complaints/${doc._id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  });

  // Admin updates status to resolved
  it("admin updates status to resolved", async () => {
    const doc = await Complaint.create({
      user: userId,
      kind: "complaint",
      category: "road",
      subject: "Fix me",
      message: "M",
      status: "pending",
    });

    const res = await request(app)
      .put(`/api/complaints/${doc._id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "resolved" });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("resolved");
  });

  // Admin adds response
  it("admin adds response", async () => {
    const doc = await Complaint.create({
      user: userId,
      kind: "complaint",
      category: "road",
      subject: "Need response",
      message: "M",
      status: "pending",
    });

    const res = await request(app)
      .put(`/api/complaints/${doc._id}/response`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ text: "We dispatched a crew to fix this." });

    expect(res.statusCode).toBe(200);
    expect(res.body.response?.text).toBe("We dispatched a crew to fix this.");
  });

  // Admin deletes complaint
  it("admin deletes complaint", async () => {
    const doc = await Complaint.create({
      user: userId,
      kind: "complaint",
      category: "road",
      subject: "Delete me",
      message: "M",
      status: "pending",
    });

    const res = await request(app)
      .delete(`/api/complaints/${doc._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);

    const exists = await Complaint.findById(doc._id);
    expect(exists).toBeNull();
  });
});