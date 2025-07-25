const mongoose = require('mongoose');

// Increase timeout for database operations
jest.setTimeout(30000);

// Setup test environment
beforeAll(async() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.MONGODB_URI_TEST = 'mongodb://localhost:27017/farmlink_test';
});

afterAll(async() => {
  // Close mongoose connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

// Suppress console.log during tests unless debugging
if (!process.env.DEBUG_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
}
