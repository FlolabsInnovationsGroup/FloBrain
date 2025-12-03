/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Seulement transformer les fichiers source + tests
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: "tsconfig.json"
    }],
  },

  testMatch: ["**/*.test.ts", "**/*.spec.ts"],

  moduleFileExtensions: ["ts", "js", "json"],

  // Ignore les dossiers qui cassent Jest
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/migrations/", "/seeders/", "/caipo-frontend/"]
};
