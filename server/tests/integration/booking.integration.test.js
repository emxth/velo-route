import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import { User } from "../../src/models/User.js";
import Booking from "../../src/models/Booking.js";
import app from "../../src/server.js";


let mongoServer;
let token;
let userId;

/* ===========================
   SETUP TEST DATABASE
=========================== */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create test user
  const user = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    role: "user",
  });

  userId = user._id;

  // Generate JWT to match auth middleware
  token = jwt.sign(
    { userId: userId.toString(), role: "user" },
    process.env.JWT_SECRET || "testsecret",
    { expiresIn: "1h" }
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// afterEach(async () => {
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     await collections[key].deleteMany();
//   }
// });
afterEach(async () => {
  await Booking.deleteMany(); // only clear bookings
});

/* ===========================
   BOOKING TESTS
=========================== */
describe("Booking Integration Tests", () => {
  it("should create a booking successfully", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        phoneNumber: "+94771234567",
        transportType: "BUS",
        tripId: "TRIP123",
        seatNumbers: ["A1"],
        fromLocation: "Colombo",
        toLocation: "Kandy",
        departureTime: new Date(),
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.seatNumbers).toContain("A1");
    expect(res.body.passenger).toBe(userId.toString());
  });

  console.log("Token : ", `Bearer ${token}`);

  it("should prevent duplicate seat booking", async () => {
    // First booking
    await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        phoneNumber: "+94771234567",
        transportType: "BUS",
        tripId: "TRIP123",
        seatNumbers: ["A1"],
        fromLocation: "Colombo",
        toLocation: "Kandy",
        departureTime: new Date(),
      });
      

    // Second booking same seat
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        phoneNumber: "+94771234567",
        transportType: "BUS",
        tripId: "TRIP123",
        seatNumbers: ["A1"],
        fromLocation: "Colombo",
        toLocation: "Kandy",
        departureTime: new Date(),
      });
    //console.log("Token create : ", res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/One or more selected seats already booked/);
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .send({
        phoneNumber: "+94771234567",
        transportType: "BUS",
        tripId: "TRIP123",
        seatNumbers: ["A2"],
        fromLocation: "Colombo",
        toLocation: "Kandy",
        departureTime: new Date(),
      });

    expect(res.statusCode).toBe(401);
  });

});
