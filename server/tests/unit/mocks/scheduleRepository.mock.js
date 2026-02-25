import { jest } from "@jest/globals";

//create mock repository for Schedule managememt
export const createMockScheduleRepository = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findLastByVehicle: jest.fn(),
    findConflict: jest.fn(),
    update: jest.fn(),
    deleteSchedule: jest.fn()
});