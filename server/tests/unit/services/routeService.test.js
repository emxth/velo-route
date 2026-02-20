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

//
