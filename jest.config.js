// jest.config.js
module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'node',

  // A path to a module that runs some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['./tests/setup.js'],
};