import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import { User } from "../../src/models/User.js";
import Department from "../../src/models/Department.js";
import Vehicle from "../../src/models/Vehicle.js";
import app from "../../src/server.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mongoServer;
let adminToken;
let adminId;
let departmentId;
let testImagePath;

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

  // Create test department
  const dept = await Department.create({
    name: "Test Department",
    managerName: "Test Manager",
    contactNumber: "0771234567",
    email: "dept@test.com",
    address: "Test Address",
    region: "Western",
    createdBy: adminId,
  });
  departmentId = dept._id;

  adminToken = jwt.sign(
    { userId: adminId.toString(), role: "admin" },
    process.env.JWT_SECRET || "testsecret",
  );

  // Create a test image file (1x1 pixel JPEG)
  testImagePath = path.join(__dirname, "test.jpg");
  const jpegBuffer = Buffer.from(
    "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==",
    "base64",
  );
  fs.writeFileSync(testImagePath, jpegBuffer);
}, 10000);

afterAll(async () => {
  if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
  await mongoose.disconnect();
  await mongoServer.stop();
}, 10000);

afterEach(async () => {
  await Vehicle.deleteMany();
});

describe("Vehicle API", () => {
  const validVehicle = {
    registrationNumber: "WP-ABC-1234",
    category: "Bus",
    type: "Passenger",
    brand: "Mercedes",
    model: "Sprinter",
    yearOfManufacture: 2021,
    seatCapacity: 40,
    department: null,
    insurance: {
      provider: "Ceylinco Insurance",
      policyNumber: "INS-12345",
      type: "Comprehensive",
      startDate: "2023-01-01",
      expiryDate: "2026-12-30",
    },
    fitness: {
      certificateNumber: "FIT-987657",
      issueDate: "2025-01-01",
      expiryDate: "2026-12-31",
    },
    lastMaintenance: {
      date: "2025-01-10",
      maintenanceType: "Full Service",
      odometer: 15000,
    },
    nextMaintenanceDue: {
      date: "2026-07-10",
      odometer: 30000,
    },
    status: "AVAILABLE",
  };

  // ========== CREATE ==========
  describe("POST /api/vehicles", () => {
    it("should create a vehicle (201) with image", async () => {
      const vehicleData = {
        ...validVehicle,
        department: departmentId.toString(),
      };

      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("registrationNumber", vehicleData.registrationNumber)
        .field("category", vehicleData.category)
        .field("type", vehicleData.type)
        .field("brand", vehicleData.brand)
        .field("model", vehicleData.model)
        .field("yearOfManufacture", vehicleData.yearOfManufacture.toString())
        .field("seatCapacity", vehicleData.seatCapacity.toString())
        .field("department", vehicleData.department)
        .field("insurance[provider]", vehicleData.insurance.provider)
        .field("insurance[policyNumber]", vehicleData.insurance.policyNumber)
        .field("insurance[type]", vehicleData.insurance.type)
        .field("insurance[startDate]", vehicleData.insurance.startDate)
        .field("insurance[expiryDate]", vehicleData.insurance.expiryDate)
        .field(
          "fitness[certificateNumber]",
          vehicleData.fitness.certificateNumber,
        )
        .field("fitness[issueDate]", vehicleData.fitness.issueDate)
        .field("fitness[expiryDate]", vehicleData.fitness.expiryDate)
        .field("lastMaintenance[date]", vehicleData.lastMaintenance.date)
        .field(
          "lastMaintenance[maintenanceType]",
          vehicleData.lastMaintenance.maintenanceType,
        )
        .field(
          "lastMaintenance[odometer]",
          vehicleData.lastMaintenance.odometer.toString(),
        )
        .field("nextMaintenanceDue[date]", vehicleData.nextMaintenanceDue.date)
        .field(
          "nextMaintenanceDue[odometer]",
          vehicleData.nextMaintenanceDue.odometer.toString(),
        )
        .field("status", vehicleData.status)
        .attach("vehiclePhoto", testImagePath);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.registrationNumber).toBe(validVehicle.registrationNumber);
      expect(res.body.vehiclePhoto).toBeDefined();
    }, 10000);

    it("should return 400 if no image uploaded", async () => {
      const vehicleData = {
        ...validVehicle,
        department: departmentId.toString(),
      };

      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("registrationNumber", vehicleData.registrationNumber)
        .field("category", vehicleData.category)
        .field("type", vehicleData.type)
        .field("brand", vehicleData.brand)
        .field("model", vehicleData.model)
        .field("yearOfManufacture", vehicleData.yearOfManufacture.toString())
        .field("seatCapacity", vehicleData.seatCapacity.toString())
        .field("department", vehicleData.department)
        .field("insurance[provider]", vehicleData.insurance.provider)
        .field("insurance[policyNumber]", vehicleData.insurance.policyNumber)
        .field("insurance[type]", vehicleData.insurance.type)
        .field("insurance[startDate]", vehicleData.insurance.startDate)
        .field("insurance[expiryDate]", vehicleData.insurance.expiryDate)
        .field(
          "fitness[certificateNumber]",
          vehicleData.fitness.certificateNumber,
        )
        .field("fitness[issueDate]", vehicleData.fitness.issueDate)
        .field("fitness[expiryDate]", vehicleData.fitness.expiryDate)
        .field("status", vehicleData.status);
      // No .attach("vehiclePhoto")

      expect(res.statusCode).toBe(400);
      // After fixing error handler, the details are in res.body.details.errors
      expect(res.body.details.errors).toContain("Vehicle photo is required");
    });

    it("should return 401 if no token", async () => {
      const res = await request(app).get("/api/vehicles");
      expect(res.statusCode).toBe(401);
    });

    it("should return 404 if department not found", async () => {
      const fakeDeptId = new mongoose.Types.ObjectId().toString();
      const vehicleData = { ...validVehicle, department: fakeDeptId };

      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("registrationNumber", vehicleData.registrationNumber)
        .field("category", vehicleData.category)
        .field("type", vehicleData.type)
        .field("brand", vehicleData.brand)
        .field("model", vehicleData.model)
        .field("yearOfManufacture", vehicleData.yearOfManufacture.toString())
        .field("seatCapacity", vehicleData.seatCapacity.toString())
        .field("department", vehicleData.department)
        .field("insurance[provider]", vehicleData.insurance.provider)
        .field("insurance[policyNumber]", vehicleData.insurance.policyNumber)
        .field("insurance[type]", vehicleData.insurance.type)
        .field("insurance[startDate]", vehicleData.insurance.startDate)
        .field("insurance[expiryDate]", vehicleData.insurance.expiryDate)
        .field(
          "fitness[certificateNumber]",
          vehicleData.fitness.certificateNumber,
        )
        .field("fitness[issueDate]", vehicleData.fitness.issueDate)
        .field("fitness[expiryDate]", vehicleData.fitness.expiryDate)
        .field("status", vehicleData.status)
        .attach("vehiclePhoto", testImagePath);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain("Department not found");
    }, 10000);

    it("should return 400 if duplicate registration", async () => {
      const vehicleData = {
        ...validVehicle,
        department: departmentId.toString(),
      };

      // First vehicle
      const firstRes = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("registrationNumber", vehicleData.registrationNumber)
        .field("category", vehicleData.category)
        .field("type", vehicleData.type)
        .field("brand", vehicleData.brand)
        .field("model", vehicleData.model)
        .field("yearOfManufacture", vehicleData.yearOfManufacture.toString())
        .field("seatCapacity", vehicleData.seatCapacity.toString())
        .field("department", vehicleData.department)
        .field("insurance[provider]", vehicleData.insurance.provider)
        .field("insurance[policyNumber]", vehicleData.insurance.policyNumber)
        .field("insurance[type]", vehicleData.insurance.type)
        .field("insurance[startDate]", vehicleData.insurance.startDate)
        .field("insurance[expiryDate]", vehicleData.insurance.expiryDate)
        .field(
          "fitness[certificateNumber]",
          vehicleData.fitness.certificateNumber,
        )
        .field("fitness[issueDate]", vehicleData.fitness.issueDate)
        .field("fitness[expiryDate]", vehicleData.fitness.expiryDate)
        .field("lastMaintenance[date]", vehicleData.lastMaintenance.date)
        .field(
          "lastMaintenance[maintenanceType]",
          vehicleData.lastMaintenance.maintenanceType,
        )
        .field(
          "lastMaintenance[odometer]",
          vehicleData.lastMaintenance.odometer.toString(),
        )
        .field("nextMaintenanceDue[date]", vehicleData.nextMaintenanceDue.date)
        .field(
          "nextMaintenanceDue[odometer]",
          vehicleData.nextMaintenanceDue.odometer.toString(),
        )
        .field("status", vehicleData.status)
        .attach("vehiclePhoto", testImagePath);

      expect(firstRes.statusCode).toBe(201);

      // Duplicate
      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("registrationNumber", vehicleData.registrationNumber)
        .field("category", vehicleData.category)
        .field("type", vehicleData.type)
        .field("brand", vehicleData.brand)
        .field("model", vehicleData.model)
        .field("yearOfManufacture", vehicleData.yearOfManufacture.toString())
        .field("seatCapacity", vehicleData.seatCapacity.toString())
        .field("department", vehicleData.department)
        .field("insurance[provider]", vehicleData.insurance.provider)
        .field("insurance[policyNumber]", vehicleData.insurance.policyNumber)
        .field("insurance[type]", vehicleData.insurance.type)
        .field("insurance[startDate]", vehicleData.insurance.startDate)
        .field("insurance[expiryDate]", vehicleData.insurance.expiryDate)
        .field(
          "fitness[certificateNumber]",
          vehicleData.fitness.certificateNumber,
        )
        .field("fitness[issueDate]", vehicleData.fitness.issueDate)
        .field("fitness[expiryDate]", vehicleData.fitness.expiryDate)
        .field("lastMaintenance[date]", vehicleData.lastMaintenance.date)
        .field(
          "lastMaintenance[maintenanceType]",
          vehicleData.lastMaintenance.maintenanceType,
        )
        .field(
          "lastMaintenance[odometer]",
          vehicleData.lastMaintenance.odometer.toString(),
        )
        .field("nextMaintenanceDue[date]", vehicleData.nextMaintenanceDue.date)
        .field(
          "nextMaintenanceDue[odometer]",
          vehicleData.nextMaintenanceDue.odometer.toString(),
        )
        .field("status", vehicleData.status)
        .attach("vehiclePhoto", testImagePath);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("already exists");
    }, 10000);
  });

  // ========== GET ALL ==========
  describe("GET /api/vehicles", () => {
    beforeEach(async () => {
      await Vehicle.create([
        {
          ...validVehicle,
          vehiclePhoto: "https://test.com/photo1.jpg",
          cloudinaryId: "id1",
          registrationNumber: "ABC-111",
          department: departmentId,
          createdBy: adminId,
        },
        {
          ...validVehicle,
          vehiclePhoto: "https://test.com/photo2.jpg",
          cloudinaryId: "id2",
          registrationNumber: "ABC-222",
          department: departmentId,
          createdBy: adminId,
        },
      ]);
    });

    it("should return paginated vehicles (200)", async () => {
      const res = await request(app)
        .get("/api/vehicles?page=1&limit=10")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });
  });

  // ========== GET ONE with computed status ==========
  describe("GET /api/vehicles/:id - computed status", () => {
    it("should return UNDER MAINTENANCE when nextMaintenanceDue date is passed", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const vehicle = await Vehicle.create({
        ...validVehicle,
        vehiclePhoto: "https://test.com/photo.jpg",
        cloudinaryId: "id-maintenance",
        registrationNumber: "MAINT-001",
        department: departmentId,
        createdBy: adminId,
        nextMaintenanceDue: { date: pastDate, odometer: 10000 },
        status: "AVAILABLE",
      });

      const res = await request(app)
        .get(`/api/vehicles/${vehicle._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("UNDER MAINTENANCE");
    });

    it("should return UNAVAILABLE when department is inactive", async () => {
      const inactiveDept = await Department.create({
        name: "Inactive Dept",
        managerName: "Inactive Manager",
        contactNumber: "0771111111",
        email: "inactive@test.com",
        address: "Inactive Address",
        region: "Western",
        status: "inactive",
        createdBy: adminId,
      });

      const vehicle = await Vehicle.create({
        ...validVehicle,
        vehiclePhoto: "https://test.com/photo.jpg",
        cloudinaryId: "id-inactive",
        registrationNumber: "INACT-001",
        department: inactiveDept._id,
        createdBy: adminId,
        status: "AVAILABLE",
      });

      const res = await request(app)
        .get(`/api/vehicles/${vehicle._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("UNAVAILABLE");
    });

    it("should return UNAVAILABLE when insurance expired", async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      const vehicle = await Vehicle.create({
        ...validVehicle,
        vehiclePhoto: "https://test.com/photo.jpg",
        cloudinaryId: "id-expired-ins",
        registrationNumber: "EXP-INS-001",
        department: departmentId,
        createdBy: adminId,
        insurance: {
          ...validVehicle.insurance,
          expiryDate: expiredDate,
        },
        status: "AVAILABLE",
      });

      const res = await request(app)
        .get(`/api/vehicles/${vehicle._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("UNAVAILABLE");
    });

    it("should return AVAILABLE when no rules apply", async () => {
      const vehicle = await Vehicle.create({
        ...validVehicle,
        vehiclePhoto: "https://test.com/photo.jpg",
        cloudinaryId: "id-available",
        registrationNumber: "AVAIL-001",
        department: departmentId,
        createdBy: adminId,
        status: "AVAILABLE",
      });

      const res = await request(app)
        .get(`/api/vehicles/${vehicle._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("AVAILABLE");
    });
  });

  // ========== UPDATE ==========
  describe("PUT /api/vehicles/:id", () => {
    let vehicleId;

    beforeEach(async () => {
      const vehicle = await Vehicle.create({
        ...validVehicle,
        vehiclePhoto: "https://test.com/photo.jpg",
        cloudinaryId: "id4",
        registrationNumber: "ABC-444",
        department: departmentId,
        createdBy: adminId,
      });
      vehicleId = vehicle._id;
    });

    it("should update vehicle (200)", async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ brand: "Updated Mercedes", status: "UNDER MAINTENANCE" });

      expect(res.statusCode).toBe(200);
      expect(res.body.brand).toBe("Updated Mercedes");
      expect(res.body.status).toBe("UNDER MAINTENANCE");
    });
  });

  // ========== DELETE ==========
  describe("DELETE /api/vehicles/:id", () => {
    let vehicleId;

    beforeEach(async () => {
      const vehicle = await Vehicle.create({
        ...validVehicle,
        vehiclePhoto: "https://test.com/photo.jpg",
        cloudinaryId: "id5",
        registrationNumber: "ABC-555",
        department: departmentId,
        createdBy: adminId,
      });
      vehicleId = vehicle._id;
    });

    it("should delete vehicle (200)", async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: "Vehicle deleted successfully" });
    });
  });
});
