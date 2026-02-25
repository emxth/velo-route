import { jest } from "@jest/globals";

export const createMockRouteRepository = () => ({
    findById: jest.fn()
})