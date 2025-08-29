# Recipe Share App - Test Documentation

This document provides an overview of the test suite for the Recipe Share application. The application uses various testing frameworks and approaches to ensure functionality works as expected across both frontend and backend.

## Testing Frameworks

### Backend Tests
- **Jest**: Main testing framework for running unit and integration tests
- **Supertest**: For API endpoint testing
- **MongoDB Memory Server**: For isolated database testing

### Frontend Tests
- **React Testing Library**: For component unit tests
- **Jest**: For running frontend tests
- **Playwright**: For end-to-end testing

## Test Structure

### Backend Tests (`/server/tests`)

1. **Unit Tests**:
   - `userModel.test.js`: Tests for the User model functionality
   - `recipeModel.test.js`: Tests for the Recipe model functionality

2. **API/Integration Tests**:
   - `auth.test.js`: Tests for authentication routes (login, register, token refresh)
   - `authMiddleware.test.js`: Tests for JWT verification middleware
   - `recipes.test.js`: Tests for recipe CRUD operations
   - `user.test.js`: Tests for user profile operations
   - `comments.test.js`: Tests for recipe comments functionality

3. **Helper Files**:
   - `helpers.js`: Contains utility functions for test setup (database connection, test data creation)
   - `jest.setup.js`: Global Jest setup configuration

### Frontend Tests (`/client/tests`)

1. **Unit Tests**:
   - `AuthPage.unit.test.js`: Tests for authentication components
   - `RecipeComponents.unit.test.js`: Tests for recipe grid and preview components
   - `Profile.unit.test.js`: Tests for profile page functionality

2. **End-to-End Tests**:
   - `recipe-creation.spec.js`: Full flow test for creating and submitting recipes

## Running Tests

### Backend Tests

```bash
# Navigate to the server directory
cd server

# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```

### Frontend Tests

```bash
# Navigate to the client directory
cd client

# Run all React component tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific unit test files
npm run test:unit

# Run end-to-end tests with Playwright
npm run test:e2e
```

## Test Coverage

The application aims for high test coverage across critical components:

- **Authentication**: Login, registration, token refresh, middleware validation
- **Recipes**: CRUD operations, searching, filtering
- **User Profiles**: Profile management, saved recipes, user statistics
- **Comments**: Adding, updating, deleting comments and ratings

## Continuous Integration

Tests are automatically run as part of the CI/CD pipeline when pushing to the repository. See `.github/workflows` directory for CI configuration.

## Writing New Tests

### Backend Tests

1. Create a new test file in `/server/tests`
2. Import the required modules and helpers
3. Use the structure: `describe` -> `it` for organizing tests
4. Use `beforeAll`, `afterAll`, `beforeEach`, and `afterEach` for setup/teardown
5. Use test helpers from `helpers.js` for common operations

### Frontend Tests

1. Create a new test file in `/client/tests`
2. Import the required components and mocks
3. Use the React Testing Library's render functions
4. Test user interactions with `fireEvent` or `userEvent`
5. Make assertions using `expect` and Jest matchers

## Testing Best Practices

1. **Isolation**: Each test should run independently without relying on other tests
2. **Speed**: Tests should be fast to execute for quick feedback
3. **Coverage**: Test both happy paths and edge cases
4. **Readability**: Tests should be easy to understand
5. **Maintainability**: Tests should be easy to update when the code changes

## Troubleshooting

- **Database Connection Issues**: Make sure MongoDB is running locally or use the test helpers
- **Timeout Errors**: Adjust Jest timeout settings for longer-running tests
- **Failed Assertions**: Check for changes in component structure or API responses
- **Playwright Test Failures**: Check for UI changes or timing issues
