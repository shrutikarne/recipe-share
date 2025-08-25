// Optional: setup for Jest, e.g., mock timers, clear DB, etc.
// You can add global setup/teardown here if needed.

// Suppress console.log during tests to avoid 'Cannot log after tests are done' errors
beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(async () => {
  // Close mongoose connection if open
  const mongoose = require("mongoose");
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});
