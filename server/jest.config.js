export default {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/?(*.)+(spec|test).[jt]s"],
  moduleFileExtensions: ["js", "json"],
  //extensionsToTreatAsEsm: [".js"],
  moduleNameMapper: {},
  transform: {},
  resetMocks: true,
  verbose: true,
  clearMocks: true,
};