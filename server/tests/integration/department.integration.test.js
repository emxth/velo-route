import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import { User } from "../../src/models/User.js";
import Department from "../../src/models/Department.js";
import app from "../../src/server.js";

let mongoServer;
let adminToken;
let adminId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create admin user
  const admin = await User.create({
    name: "Admin User",
    email: "admin@test.com",
    password: "password123",
    role: "admin",
  });
  adminId = admin._id;

  adminToken = jwt.sign(
    { userId: adminId.toString(), role: "admin" },
    process.env.JWT_SECRET || "testsecret",
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Department.deleteMany();
});

describe("Department API", () => {
  const validDepartment = {
    name: "Transport Department",
    managerName: "John Doe",
    contactNumber: "0771234567",
    email: "transport@example.com",
    address: "123 Main Street, Colombo",
    region: "Western",
  };

  // ========== CREATE ==========
  describe("POST /api/departments", () => {
    it("should create a department (201)", async () => {
      const res = await request(app)
        .post("/api/departments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validDepartment);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.name).toBe(validDepartment.name);
    });

    it("should return 401 if no token", async () => {
      const res = await request(app)
        .post("/api/departments")
        .send(validDepartment);
      expect(res.statusCode).toBe(401);
    });

    it("should return 400 if required fields missing", async () => {
      const res = await request(app)
        .post("/api/departments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Only Name" });
      expect(res.statusCode).toBe(400);
    });
  });

  // ========== GET ALL ==========
  describe("GET /api/departments", () => {
    beforeEach(async () => {
      await Department.create([
        { ...validDepartment, createdBy: adminId },
        {
          ...validDepartment,
          name: "Second Dept",
          email: "second@test.com",
          createdBy: adminId,
        },
      ]);
    });

    it("should return paginated departments (200)", async () => {
      const res = await request(app)
        .get("/api/departments?page=1&limit=10")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });
  });

  // ========== GET ONE ==========
  describe("GET /api/departments/:id", () => {
    let deptId;

    beforeEach(async () => {
      const dept = await Department.create({
        ...validDepartment,
        createdBy: adminId,
      });
      deptId = dept._id;
    });

    it("should return department by id (200)", async () => {
      const res = await request(app)
        .get(`/api/departments/${deptId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(validDepartment.name);
    });

    it("should return 404 if not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/departments/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  // ========== UPDATE ==========
  describe("PUT /api/departments/:id", () => {
    let deptId;

    beforeEach(async () => {
      const dept = await Department.create({
        ...validDepartment,
        createdBy: adminId,
      });
      deptId = dept._id;
    });

    it("should update department (200)", async () => {
      const res = await request(app)
        .put(`/api/departments/${deptId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Updated Name" });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe("Updated Name");
    });
  });

  // ========== DELETE ==========
  describe("DELETE /api/departments/:id", () => {
    let deptId;

    beforeEach(async () => {
      const dept = await Department.create({
        ...validDepartment,
        createdBy: adminId,
      });
      deptId = dept._id;
    });

    it("should delete department (200)", async () => {
      const res = await request(app)
        .delete(`/api/departments/${deptId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: "Department deleted successfully" });
    });
  });
});
