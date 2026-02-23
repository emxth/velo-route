export default {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/?(*.)+(spec|test).[jt]s"],
  moduleFileExtensions: ["js", "json"],
  transform: {},
  resetMocks: true,
  clearMocks: true,
};