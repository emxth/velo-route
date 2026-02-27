import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../src/server";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "@jest/globals";
import RouteT from "../../src/models/RouteT";


let mongoServer;


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

})

//test cases for route management
describe("Route Management Integration", () => {
    test("should create route successfully", async () => {
        const res = await request(app)
            .post("/api/routes/addRoute")
            .send({
                name: "Ragama to Kadawatha",
                routeNumber: "A5",
                transportType: "Bus",
                busNumber: "222",
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

        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe("Ragama to Kadawatha");
        expect(res.body.stops.length).toBe(3);

        routeId = res.body._id;
    });

    test("Should reject invalid stops", async () => {
        const res = await request(app)
            .post("/api/routes/addRoute")
            .send({
                name: "Ragama to Kadawatha",
                routeNumber: "A5",
                transportType: "Bus",
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
                    }
                ]
            });

        expect(res.statusCode).toBe(400);
    })
})