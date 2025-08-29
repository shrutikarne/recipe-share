module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!jest.config.js",
    "!**/tests/**"
  ],
  coverageReporters: ["text", "lcov", "clover", "html"],
  coverageDirectory: "coverage",
  verbose: true
};
