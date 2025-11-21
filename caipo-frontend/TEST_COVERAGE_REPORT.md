# Test Coverage Report

## Test Suite Overview

This document tracks the test coverage for the caipo-frontend application. All tests follow best practices focusing on behavior rather than implementation details.

## ✅ API Tests (axiosClient.test.ts)

**Total: 11 tests**

### Request Interceptor Tests (3 tests)
- ✅ Attaches token from localStorage to Authorization header and sets loading state
- ✅ Works without token (no Authorization header when token is missing)
- ✅ Sets loading to false on request error

### Response Interceptor Tests (4 tests)
- ✅ Sets loading to false and clears error on success
- ✅ Dispatches error message from `response.data.message` on non-401 errors
- ✅ Uses `error.message` when `response.data.message` is not available
- ✅ Uses default error message ("An error occurred") when neither response nor message exists

### Token Refresh (401 Handling) Tests (4 tests)
- ✅ Refreshes token and retries original request on 401 error
- ✅ Saves new token to localStorage after successful refresh
- ✅ Redirects to `/login` and clears token on refresh failure
- ✅ Does not retry if `_retry` flag is already set (prevents infinite loops)
- ✅ Queues concurrent requests during token refresh (ensures only one refresh call)

## ✅ Store Tests - appSlice (appSlice.test.ts)

**Total: 9 tests**

### Initial State
- ✅ Returns correct initial state

### setLoading Action (2 tests)
- ✅ Sets loading to true
- ✅ Sets loading to false

### setError Action (2 tests)
- ✅ Sets error message
- ✅ Sets error to null (clears error)

### setGlobalLoading Action (2 tests)
- ✅ Sets globalLoading to true
- ✅ Sets globalLoading to false

### clearError Action (2 tests)
- ✅ Clears error from state
- ✅ Does not affect other state properties

## ✅ Store Tests - authSlice (authSlice.test.ts)

**Total: 15 tests**

### Initial State
- ✅ Returns correct initial state

### logout Action (1 test)
- ✅ Clears user and sets isAuthenticated to false

### checkAuth Async Thunk (3 tests)
- ✅ Handles pending state (sets loading to true)
- ✅ Handles fulfilled state (sets user, isAuthenticated to true)
- ✅ Handles rejected state (clears user, removes token)

### loginUser Async Thunk (3 tests)
- ✅ Handles pending state
- ✅ Handles fulfilled state (sets user and token)
- ✅ Handles rejected state (handles errors)

### registerUser Async Thunk (3 tests)
- ✅ Handles pending state
- ✅ Handles fulfilled state (sets user and token)
- ✅ Handles rejected state (handles errors)

### Async Thunks Integration Tests (4 tests)
- ✅ checkAuth calls axiosClient.get with correct endpoint
- ✅ checkAuth throws error when no token exists
- ✅ loginUser calls axiosClient.post with correct data
- ✅ registerUser calls axiosClient.post with correct data

## Summary

**Total Test Cases:** 35
- API Tests: 11
- Store Tests (appSlice): 9
- Store Tests (authSlice): 15

**Coverage Status:** ✅ All test cases implemented and passing

### Test Quality Improvements

The test suite has been refactored to follow best practices:
- ✅ Focus on behavior rather than implementation details
- ✅ Clear, descriptive test names
- ✅ Simplified error handling using `expect().rejects`
- ✅ Removed redundant tests
- ✅ Proper mock setup and cleanup
- ✅ All tests are independent and can run in any order

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/api/__tests__/axiosClient.test.ts

# Run with coverage
npm test -- --coverage
```
