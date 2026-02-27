import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../src/server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import RouteT from "../../src/models/RouteT";
import Schedule from "../../src/models/Schedule";


let mongoServer;
let routeId;
let vehicleId;


//test datase setup
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await RouteT.deleteMany();
    await Schedule.deleteMany();

});


describe("Schedule Management Integration", () => {

    //before run schedule test case create route
    beforeEach(async () => {
        const route = await RouteT.create({
            name: "Ragama to Kadawatha",
            routeNumber: "A5",
            transportType: "Bus",
            busNumber: "222",
            estimatedDuration: 45,
            startLocation: {
                name: "Kadawatha",
                district: "Gampaha",
                lat: 7.0015,
                lng: 79.9582
            },
            endLocation: {
                name: "Ragama",
                district: "Gampaha",
                lat: 7.0300,
                lng: 79.9200
            },
            stops: [
                {
                    name: "Ragama",
                    lat: 7.0015,
                    lng: 79.9582,
                    fareFromPrevious: 0
                },
                {
                    name: "Delpe",
                    lat: 7.0209,
                    lng: 79.9355,
                    fareFromPrevious: 30
                },
                {
                    name: "Kadawatha",
                    lat: 7.0300,
                    lng: 79.9200,
                    fareFromPrevious: 45
                }
            ]
        });
        routeId = route._id;
        vehicleId = new mongoose.Types.ObjectId();
    });

    test("Should create Schedule successfully", async () => {

        const departureTime = "2026-03-01T08:10:00Z";

        const res = await request(app)
            .post("/api/schedules/addSchedule")
            .send({
                routeId,
                vehicleID: vehicleId,
                depatureTime: departureTime,
                frequency: "DAILY",
                status: "SCHEDULED"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.routeId).toBe(routeId.toString());

        const departure = new Date(departureTime)
        const arrival = new Date(res.body.arrivalTime);
        expect(arrival.getTime()).toBeGreaterThan(departure.getTime());
    });

    test("should prevent vehicle condlict", async () => {

        const departure = new Date();

        await Schedule.create({
            routeId,
            vehicleID: vehicleId,
            depatureTime: departure,
            arrivalTime: new Date(departure.getTime() + 60 * 60000),
            status: "SCHEDULED",
            active: true
        });

        const res = await request(app)
            .post("/api/schedules/addSchedule")
            .send({
                routeId,
                vehicleID: vehicleId,
                depatureTime: departure,
                frequency: "DAILY",
                status: "SCHEDULED"
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/Conflict|busy/i);

    });

    test("Should reject invalid route", async () => {
        const res = await request(app)
            .post("/api/schedules/addSchedule")
            .send({
                routeId: new mongoose.Types.ObjectId(),
                vehicleID: vehicleId,
                depatureTime: new Date(),
                frequency: "DAILY",
                status: "SCHEDULED"
            });

        expect(res.statusCode).toBe(400);
    })
})