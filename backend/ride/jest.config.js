/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test/settings/jest.setup.ts"],
  globalTeardown: "<rootDir>/test/settings/teardown.ts",
};
