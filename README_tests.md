# CAIPO Backend - Testing & Validation Guide

This document outlines the complete testing strategy, tooling, and operational procedures for the CAIPO Backend project. The goal of this test suite is to ensure code quality, prevent regressions, and validate all API functionalities from end to end.

## 1. Testing Philosophy

The project employs a two-tiered testing strategy:

1.  **Unit & Validation Tests (`__tests__/`):** These are fast, lightweight tests that run in isolation and **do not** require a database connection. They are primarily used to validate small pieces of logic, utility functions, and Zod validation schemas.
2.  **Integration Tests (`tests/`):** These are full end-to-end tests that validate the complete behavior of the API. They run against a **real, managed PostgreSQL database** to ensure that controllers, models, and database interactions work together as expected.

---

## 2. Core Tooling

| Tool | Role |
| :--- | :--- |
| **Jest** | The primary test runner, assertion library, and mocking framework. |
| **Supertest** | Used to make HTTP requests to the Express application directly in-memory, without needing a running network port. |
| **Zod** | Enforces a strict validation contract on API inputs (params, query, body). |
| **TypeScript** | All tests are written in TypeScript using `ts-jest`. |
| **PostgreSQL** | The database used for all integration tests. |

---

## 3. How to Run Tests

All test commands are defined in `package.json`.

- #### Run All Tests
  This command executes the complete test suite.
  ```bash 
  npm test
- #### Generate a Coverage Report
  Run all tests and generate a detailed coverage report:
  ```bash
  npm run coverage
  The HTML report is available at:
  ```bash
  coverage/lcov-report/index.html
- #### Run a Specific Test File
    Execute one test file only:
    ```bash
    test -- <path_to_file>
    Example:
    ```bash
    npm test -- tests/media/media.integration.test.ts 

## 4. ⚙️ Test Environment & Configuration

- #### Environment File:
All tests load variables from .env.test, which must define a valid DATABASE_URL for the test database.
- #### Global Setup Files:
The Jest configuration (jest.config.cjs) runs two setup scripts before the tests start:

1. tests/setup/jest.setup.ts — Configures global mocks (e.g., uuid, mime).
2. tests/setup/db.ts — Handles test database initialization and teardown.

## 5. 🗄️ Database Lifecycle Management
To ensure deterministic and isolated tests, the database is reset before each test:
Phase | Hook | Description |
------|-------|-------------|
Setup |beforeAll() | Connects to the DB, drops existing tables, and recreates schema.|
Before Each Test| beforeEach() |Truncates tables and reseeds them with fixtures (User A, User B,1,2, etc.).|
Teardown |afterAll() | Closes DB connection gracefully. | 

This guarantees that every test starts from a clean and predictable state.

## 6. 🎭 Mocking Strategy

Some modules and external services are mocked to improve reliability and speed.

a. Module Mocks
Certain ESM-only or problematic modules (like uuid, mime) are globally mocked in
tests/setup/jest.setup.ts for compatibility with Jest.
b. AI Service Mock
The external AI service is fully mocked to ensure deterministic testing and no network calls.

The mock behavior depends on the AI_TEST_MODE environment variable:
| Mode         | Behavior                                      |
| ------------ | --------------------------------------------- |
| `success`    | Returns a valid simulated response instantly. |
| `timeout`    | Simulates a network delay or timeout.         |
| `http_error` | Simulates a 500 Internal Server Error.        |

This allows testing of both success and failure scenarios.

## 7. 🧩 Folder Structure Overview

tests/
├── media/
│   ├── media.integration.test.ts   # End-to-end tests for upload, list, update, delete
│   └── validation.test.ts          # Input validation and schema tests
├── fixtures/
│   └── db.ts                       # Database seed and reset helpers
├── setup/
│   ├── db.ts                       # Database lifecycle hooks (beforeAll, beforeEach, afterAll)
│   └── jest.setup.ts               # Global Jest setup (mocks, global vars)

## 8. 📊 Coverage Targets

| Metric         |    Result   | Target | Status |
| :------------- | :---------: | :----: | :----: |
| **Statements** |  **88.7 %** | ≥ 80 % |    ✅   |
| **Branches**   | **65.27 %** | ≥ 60 % |    ✅   |
| **Functions**  |  **100 %**  | ≥ 75 % |    ✅   |
| **Lines**      | **95.16 %** | ≥ 80 % |    ✅   |

If coverage drops below these thresholds, the CI pipeline will fail.

## 9. 🚀 Best Practices

- Write clear test names describing expected behavior (e.g., should return 400 when missing media_type).
- Avoid depending on test order — every test must be self-contained.
- Use fixtures for reproducibility instead of dynamic data.
- Keep tests fast, isolated, and idempotent.
- When adding new endpoints, include:
    - 1 integration test
    - 1 validation test (if applicable)

## 10. 🧱 Summary

✅ Unit tests verify internal logic.
✅ Integration tests verify API behavior.
✅ Mocking ensures stability and determinism.
✅ Database reset guarantees isolation.
✅ Coverage enforces quality.

This test infrastructure ensures that the CAIPO backend remains stable, scalable, and well-documented as it grows.