/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/{__tests__,tests}/**/*.test.ts"], // ← TS only
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  coverageThreshold: { global: { lines: 70, statements: 70 } },
  moduleFileExtensions: ["ts", "js", "json"],
  setupFiles: ["<rootDir>/tests/setup/env.ts"],
  setupFilesAfterEnv: [
    "<rootDir>/tests/setup/jest.setup.ts", 
    "<rootDir>/tests/setup/db.ts"           
  ],

};
