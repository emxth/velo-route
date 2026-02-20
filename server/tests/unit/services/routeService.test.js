import { beforeEach, describe, expect, jest } from "@jest/globals";
import mongoose from "mongoose";
import { RouteRepository } from "../../../src/repositories/RouteRepository";


//create mock function to replace actual repository method
const createRouteMock = jest.fn();
const findByIDMock = jest.fn();
const updateMock = jest.fn();
const deleteRouteMock = jest.fn();

//create mock repository
jest.unstable_mockModule("../../../src/repositories/RouteRepository.js", () => ({
    RouteRepository: jest.fn().mockImplementation(() => ({
        create: createRouteMock,
        findById: findByIDMock,
        update: updateMock,
        delete: deleteRouteMock,
    }))

}));

//import service to mocks inject
const { RouterService } = await import("../../../src/services/routeService.js");

//test case for create Route
describe("CreateRoute", () => {

    const service = new RouterService();

    //before run test case clear cache 
    beforeEach(() => {
        jest.clearAllMocks();

    });

    test("Create Route successfully", async () => {
        createRouteMock.mockResolvedValue({
            name: "Test Route"
        });

        service.calculateRouteDistance = jest.fn().mockResolvedValue({
            destinationKM: 100,
            destinationTime: 120
        });

        const result = await service.createRoute({
            name: "Test Route",
            stops: [{}, {}, {}]
        });

        expect(createRouteMock).toHaveBeenCalled();
        expect(result.name).toBe("Test Route");
    });

    test("Reject Invalid stops", async () => {
        await expect(service.createRoute({
            name: "Bad Route",
            stops: [{}]
        })).rejects.toThrow("Route must contain at least 2 stops");
    })
})

// test case for get specific Route
describe("getRouteByID", () => {
    const service = new RouterService();

    test("Should throw if not found", async () => {
        findByIDMock.mockResolvedValue(null);

        await expect(service.getRouteByID("bad-id"))
            .rejects
            .toThrow("Route not Found");
    });

    test("should return route if found", async () => {
        findByIDMock.mockResolvedValue({
            _doc: {
                name: "Route 1",
                stops: []
            },
            stops: []
        });

        const result = await service.getRouteByID("123");
        expect(result.name).toBe("Route 1");
        expect(findByIDMock).toHaveBeenCalledWith("123");

    });
    test("Should throw when ID is invalid format", async () => {

        const error = new Error("Invalid ID format");
        error.name = "CastError";
        findByIDMock.mockRejectedValue(error);

        await expect(service.getRouteByID("A11"))
            .rejects
            .toThrow("Invalid ID format");
    });

})
