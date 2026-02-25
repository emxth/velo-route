import { afterEach, beforeEach, describe, expect, jest } from "@jest/globals";
import mongoose from "mongoose";
import { ScheduleRepository } from "../../../src/repositories/scheduleRepository";
import { createMockScheduleRepository } from "../mocks/scheduleRepository.mock";
import { createMockRouteRepository } from "../mocks/routeRepository.mock";
import { ScheduleService } from "../../../src/services/scheduleService";


//test create schedule
describe("createSchedule()", () => {
    let scheduleRepo;
    let routeRepo;
    let service;

    //run before run each test cases
    beforeEach(() => {
        scheduleRepo = createMockScheduleRepository();
        routeRepo = createMockRouteRepository();
        service = new ScheduleService(scheduleRepo, routeRepo);
    });

    //after run each test case cleean cache
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should create schedule successfully when no conflict found", async () => {

        const scheduleData = {
            routeId: "route1",
            vehicleID: "vehi2",
            depatureTime: "2026-03-01T08:10:00Z",
            frequency: "DAILY",
            status: "SCHEDULED",
        };

        routeRepo.findById.mockResolvedValue({
            estimatedDuration: 60
        });

        scheduleRepo.findLastByVehicle.mockResolvedValue(null);
        scheduleRepo.findConflict.mockResolvedValue(null);
        scheduleRepo.create.mockResolvedValue({
            id: "schedule123"
        });

        //create schedule
        const result = await service.createSchedule(scheduleData);

        expect(routeRepo.findById).toHaveBeenCalledWith("route1");
        expect(scheduleRepo.create).toHaveBeenCalled();
        expect(result).toEqual({ id: "schedule123" });
    });

    //check route availability
    it("should throw error if route not exist", async () => {
        routeRepo.findById.mockResolvedValue(null);

        await expect(
            service.createSchedule({
                routerId: "Invalid",
                vehicleID: "vehi2",
                depatureTime: "2026-03-01T08:10:00Z"
            })
        ).rejects.toThrow("Route not Found");
    });

    //check vehicle availability
    it("should throw error if vehicle is busy from last trip", async () => {
        routeRepo.findById.mockResolvedValue({ estimatedDuration: 60 });

        scheduleRepo.findLastByVehicle.mockResolvedValue({
            arrivalTime: new Date("2026-02-25T08:10:00Z")
        });

        await expect(
            service.createSchedule({
                routeId: "r1",
                vehicleID: "v1",
                depatureTime: "2026-02-25T07:30:00Z"
            })
        ).rejects.toThrow("Vehicle still busy from previous trip");
    });

    //check conflicts
    it("Should throw error if conflict exists", async () => {

        routeRepo.findById.mockResolvedValue({ estimatedDuration: 60 });
        scheduleRepo.findLastByVehicle.mockResolvedValue(null);
        scheduleRepo.findConflict.mockResolvedValue({ id: "conflict1" });

        await expect(
            service.createSchedule({
                routeId: "r1",
                vehicleID: "v1",
                depatureTime: "2026-02-25T08:00:00Z"
            })
        ).rejects.toThrow("Schedule Conflict detected");
    });
});

describe("Schedule - UpdateSchedule()", () => {

    let scheduleRepo;
    let routeRepo;
    let service;

    //run before run each test cases
    beforeEach(() => {
        scheduleRepo = createMockScheduleRepository();
        routeRepo = createMockRouteRepository();
        service = new ScheduleService(scheduleRepo, routeRepo);
    });

    //after run each test case cleean cache
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should update schedule successfully", async () => {
        scheduleRepo.findById.mockResolvedValue({
            routerId: "route1",
            depatureTime: "2026-02-25T08:00:00Z",
            vehicleID: "vehicle1"
        });

        routeRepo.findById.mockResolvedValue({
            estimatedDuration: 60
        });

        //scheduleRepo.findById.mockResolvedValue(null);
        scheduleRepo.update.mockResolvedValue({ id: "updated1" });

        const result = await service.updateSchedual("schedule123", {
            depatureTime: "2026-02-25T10:00:00Z"
        });

        expect(scheduleRepo.update).toHaveBeenCalled();
        expect(result).toEqual({ id: "updated1" });
    });

    it("should throw error if schedule not found", async () => {
        scheduleRepo.findById.mockResolvedValue(null);

        await expect(
            service.updateSchedual("invalid", {})
        ).rejects.toThrow("Schedule not Found");
    });
});

