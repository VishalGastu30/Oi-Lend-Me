/**
 * Jest Global Setup
 * Mocks and helpers for all test suites
 */

// Suppress console.error/log noise in tests unless DEBUG_TESTS is set
if (!process.env.DEBUG_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
}

// Set test environment variables
process.env.NEXTAUTH_SECRET = 'test-secret-do-not-use-in-production-32chars!!';
process.env.NODE_ENV = 'test';
