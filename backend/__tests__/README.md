# SLA Configuration Tests

## Overview

This test suite validates the SLA Configuration API endpoints for the RCMS backend.

## Test Coverage

### 1. Valid Configuration Updates
- ✅ Successfully update SLA configuration with valid values
- ✅ Create new configuration if none exists
- ✅ Update existing configuration
- ✅ Track updatedBy field

### 2. Invalid Hierarchy Validation
- ✅ Reject when high >= medium
- ✅ Reject when high > medium
- ✅ Reject when medium >= low
- ✅ Reject when medium > low
- ✅ Reject when all values are equal

### 3. Missing Fields and Non-Positive Values
- ✅ Reject when high field is missing
- ✅ Reject when medium field is missing
- ✅ Reject when low field is missing
- ✅ Reject when all fields are missing
- ✅ Reject when high is zero
- ✅ Reject when medium is negative
- ✅ Reject when low is negative
- ✅ Reject when all values are zero

### 4. Unauthorized Access Attempts
- ✅ Reject update without authentication token
- ✅ Reject update from regular admin user
- ✅ Reject update with invalid token
- ✅ Reject update with malformed authorization header
- ✅ Reject GET request without authentication
- ✅ Reject GET request from non-super-admin

## Prerequisites

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **MongoDB (Automatic)**
   - Tests use `mongodb-memory-server` which automatically starts an in-memory MongoDB instance
   - No need to have MongoDB running locally
   - Each test run uses a fresh, isolated database

3. **Environment Variables**
   - The test suite automatically sets `NODE_ENV=test` and `JWT_SECRET`
   - No additional configuration needed

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run specific test file
```bash
npm test slaConfiguration.test.js
```

### Run with coverage
```bash
npm test -- --coverage
```

## Test Structure

```
backend/
├── __tests__/
│   ├── slaConfiguration.test.js  # SLA Configuration API tests
│   └── README.md                  # This file
├── models/
│   └── SLAConfiguration.js        # Model being tested
├── controllers/
│   └── superAdminController.js    # Controller being tested
└── routes/
    └── superAdminRoutes.js        # Routes being tested
```

## Notes

- Tests run in isolation with a clean database state
- Each test suite creates its own test users (super admin and regular admin)
- Database is cleaned up after all tests complete
- Tests use `--runInBand` flag to run sequentially (prevents database conflicts)
- Test timeout is set to 30 seconds to accommodate database operations

## Troubleshooting

### Test Timeout Issues
If you see timeout errors during setup:
1. The first run may take longer as `mongodb-memory-server` downloads MongoDB binaries
2. Subsequent runs will be faster as binaries are cached
3. Increase timeout in `jest.setup.js` if needed

### JWT Secret Issues
If authentication fails:
1. The test suite automatically sets `JWT_SECRET=test-secret-key-for-testing`
2. Check that the secret matches between test setup and middleware

### Memory Issues
If tests fail with memory errors:
1. `mongodb-memory-server` uses RAM for the database
2. Close other applications to free up memory
3. Tests clean up after themselves automatically
