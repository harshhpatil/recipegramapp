# Testing Guide

## Overview
This guide covers the comprehensive testing strategy for RecipeGram, including unit tests, integration tests, and end-to-end testing patterns.

## Table of Contents
1. [Testing Stack](#testing-stack)
2. [Frontend Testing](#frontend-testing)
3. [Backend Testing](#backend-testing)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Test Coverage](#test-coverage)

## Testing Stack

### Frontend
- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: Vitest mocks
- **Environment**: jsdom

### Backend
- **Test Runner**: Jest
- **HTTP Testing**: Supertest
- **Database**: MongoDB Memory Server
- **Environment**: Node.js

## Frontend Testing

### Setup

Tests are configured in `/client/vitest.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
```

### Test Structure

#### Component Tests
Location: `client/src/pages/Home.test.jsx`

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

describe('Home Component', () => {
  it('should handle undefined posts array gracefully', () => {
    const initialState = {
      posts: {
        posts: undefined,
        loading: false,
        error: null,
      },
    };
    
    renderWithProviders(<Home />, initialState);
    expect(screen.getByText(/No posts yet/i)).toBeInTheDocument();
  });
});
```

#### Redux Tests
Location: `client/src/store/slices/postSlice.test.js`

```javascript
describe('postSlice', () => {
  it('should handle fetchPostsSuccess with reset', () => {
    const posts = [{ _id: '1', caption: 'Post 1' }];
    const state = postReducer(
      initialState,
      fetchPostsSuccess({ posts, hasMore: true, page: 1, reset: true })
    );
    
    expect(state.posts).toEqual(posts);
    expect(state.loading).toBe(false);
  });
});
```

### Frontend Test Categories

#### 1. Component Rendering Tests
Test that components render correctly with different props and states:
- Loading states
- Empty states
- Error states
- Populated states

#### 2. User Interaction Tests
Test user interactions using `@testing-library/user-event`:
```javascript
import userEvent from '@testing-library/user-event';

it('should submit comment on button click', async () => {
  const user = userEvent.setup();
  
  const input = screen.getByPlaceholderText('Add a comment...');
  await user.type(input, 'Great recipe!');
  
  const button = screen.getByText('Post');
  await user.click(button);
  
  await waitFor(() => {
    expect(mockAddComment).toHaveBeenCalled();
  });
});
```

#### 3. Redux State Tests
Test state mutations, actions, and selectors:
- Action creators
- Reducers
- State updates
- Optimistic updates

#### 4. Edge Case Tests
Test boundary conditions:
- Undefined/null values
- Empty arrays
- Maximum length inputs
- Invalid data

### Mocking in Frontend Tests

#### Mock Redux Store
```javascript
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      posts: postReducer,
      auth: (state = { user: null }) => state,
    },
    preloadedState: initialState,
  });
};
```

#### Mock API Services
```javascript
vi.mock('../../services', () => ({
  commentService: {
    addComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}));
```

#### Mock Hooks
```javascript
vi.mock('../hooks', () => ({
  usePosts: () => ({
    fetchPosts: vi.fn().mockResolvedValue({ success: true }),
  }),
}));
```

## Backend Testing

### Setup

Tests use MongoDB Memory Server for isolated database testing:
```javascript
// testSetup.js
export const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};
```

### Test Structure

#### API Endpoint Tests
Location: `server/src/__tests__/post.test.js`

```javascript
describe('POST /posts', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    await clearTestDB();
    testUser = await User.create({...});
    authToken = jwt.sign({ userId: testUser._id }, secret);
  });

  it('should create a new post with valid data', async () => {
    const response = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .send(postData)
      .expect(201);

    expect(response.body.post.caption).toBe(postData.caption);
  });
});
```

### Backend Test Categories

#### 1. CRUD Operation Tests
- Create resources
- Read resources (single and list)
- Update resources
- Delete resources

#### 2. Authorization Tests
Test access control:
```javascript
it('should return 403 if user is not author', async () => {
  const otherUser = await User.create({...});
  const otherToken = jwt.sign({ userId: otherUser._id }, secret);

  await request(app)
    .put(`/posts/${testPost._id}`)
    .set('Authorization', `Bearer ${otherToken}`)
    .send({ caption: 'Hacked!' })
    .expect(403);
});
```

#### 3. Validation Tests
Test input validation:
```javascript
it('should return 400 if caption is missing', async () => {
  await request(app)
    .post('/posts')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ image: 'url' })
    .expect(400);
});
```

#### 4. Data Integrity Tests
Test database consistency:
```javascript
it('should increment commentsCount when adding comment', async () => {
  await request(app)
    .post(`/comments/${testPost._id}`)
    .set('Authorization', `Bearer ${authToken}`)
    .send({ text: 'Comment' });

  const updatedPost = await Post.findById(testPost._id);
  expect(updatedPost.commentsCount).toBe(1);
});
```

#### 5. Population Tests
Test that relations are properly populated:
```javascript
it('should populate author data', async () => {
  const response = await request(app)
    .get('/posts')
    .set('Authorization', `Bearer ${authToken}`);

  expect(response.body.posts[0].author.username).toBeDefined();
});
```

## Running Tests

### Frontend Tests
```bash
# Run all tests
cd client && npm test

# Run in watch mode (not available in one-shot)
npm test -- --watch

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- src/pages/Home.test.jsx
```

### Backend Tests
```bash
# Run all tests
cd server && npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- --testNamePattern="POST /posts"

# Run specific file
npm test -- post.test.js
```

### Run All Tests
```bash
# From root directory
cd client && npm test -- --run && cd ../server && npm test
```

## Writing Tests

### Test Naming Conventions

#### Frontend
- Test files: `ComponentName.test.jsx` or `sliceName.test.js`
- Describe blocks: Component/feature name
- Test cases: "should [expected behavior]"

Example:
```javascript
describe('Home Component', () => {
  it('should display loading skeletons when loading', () => {
    // test implementation
  });
});
```

#### Backend
- Test files: `resource.test.js` (e.g., `post.test.js`)
- Describe blocks: API endpoint or feature
- Test cases: "should [expected behavior]"

Example:
```javascript
describe('POST /posts', () => {
  it('should create a new post with valid data', async () => {
    // test implementation
  });
});
```

### Test Organization

#### Arrange-Act-Assert Pattern
```javascript
it('should like a post', async () => {
  // Arrange
  const postData = { caption: 'Test', image: 'url' };
  const post = await Post.create(postData);
  
  // Act
  const response = await request(app)
    .post(`/likes/${post._id}`)
    .set('Authorization', `Bearer ${authToken}`);
  
  // Assert
  expect(response.status).toBe(200);
  const like = await Like.findOne({ post: post._id });
  expect(like).toBeDefined();
});
```

### Common Testing Patterns

#### Testing Async Operations
```javascript
it('should handle async API call', async () => {
  const promise = apiService.getData();
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

#### Testing Error States
```javascript
it('should display error message on failure', async () => {
  apiService.getData.mockRejectedValue(new Error('Failed'));
  
  render(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText(/Failed/i)).toBeInTheDocument();
  });
});
```

#### Testing Form Submissions
```javascript
it('should submit form with valid data', async () => {
  render(<Form onSubmit={mockSubmit} />);
  
  const input = screen.getByLabelText('Caption');
  fireEvent.change(input, { target: { value: 'Test caption' } });
  
  const button = screen.getByText('Submit');
  fireEvent.click(button);
  
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({ caption: 'Test caption' });
  });
});
```

## Test Coverage

### Current Coverage

#### Frontend (37 tests)
```
✓ Home.test.jsx (7 tests)
  - Loading states
  - Empty states
  - Error handling
  - Undefined array handling

✓ CommentSection.test.jsx (11 tests)
  - Comment display
  - Comment submission
  - Comment deletion
  - Validation
  - Authorization

✓ postSlice.test.js (19 tests)
  - Fetch actions
  - CRUD operations
  - Like/unlike
  - Comments
  - Edge cases
```

#### Backend (29 tests)
```
✓ post.test.js (11 tests)
  - Create post
  - Get posts (paginated)
  - Get single post
  - Update post
  - Delete post
  - Authorization

✓ comment.test.js (10 tests)
  - Add comment
  - Get comments
  - Delete comment
  - Validation
  - Data integrity

✓ like.test.js (8 tests)
  - Toggle like/unlike
  - Check like status
  - Get likes
  - Authorization
```

### Coverage Goals
- **Frontend**: 80% code coverage
- **Backend**: 80% code coverage
- **Critical paths**: 100% coverage

### Generating Coverage Reports

#### Frontend
```bash
cd client
npm run test:coverage
# Opens coverage report in browser
```

#### Backend
```bash
cd server
npm run test:coverage
# Coverage report generated in /coverage directory
```

## Debugging Tests

### Frontend Debugging
```javascript
// Use screen.debug() to see rendered output
it('should render component', () => {
  render(<Component />);
  screen.debug(); // Prints DOM to console
});

// Log specific elements
const element = screen.getByText('Hello');
console.log(element.outerHTML);
```

### Backend Debugging
```javascript
// Add console.logs in tests
it('should create post', async () => {
  console.log('Request body:', postData);
  const response = await request(app).post('/posts').send(postData);
  console.log('Response:', response.body);
});

// Use --verbose flag
npm test -- --verbose
```

## Best Practices

1. **Write tests before fixing bugs** - Reproduce the bug in a test first
2. **Test behavior, not implementation** - Focus on what the user sees
3. **Keep tests isolated** - Each test should be independent
4. **Use descriptive test names** - "should do X when Y"
5. **Mock external dependencies** - Don't make real API calls
6. **Clean up after tests** - Use afterEach to reset state
7. **Test edge cases** - Empty arrays, null values, errors
8. **Maintain test data** - Use factories or fixtures
9. **Keep tests fast** - Avoid unnecessary delays
10. **Review test coverage** - Aim for comprehensive coverage

## Continuous Integration

### GitHub Actions Workflow
Tests should run on:
- Pull requests
- Pushes to main branch
- Pre-deployment

Example workflow:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm run install-all
      - name: Run frontend tests
        run: cd client && npm test -- --run
      - name: Run backend tests
        run: cd server && npm test
```

## Troubleshooting

### Common Issues

#### "Cannot find module"
- Check import paths
- Ensure file extensions are correct (.jsx vs .js)
- Verify test setup files are loaded

#### "Timeout of Xms exceeded"
- Increase timeout in test config
- Check for unresolved promises
- Ensure async operations complete

#### "MongoDB Memory Server download failed"
- Tests need internet to download MongoDB first time
- Binary is cached after first download
- Can configure offline mode with pre-downloaded binary

#### "Jest/Vitest not found"
- Install dev dependencies: `npm install`
- Check package.json scripts
- Verify NODE_OPTIONS for Jest ESM support

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
