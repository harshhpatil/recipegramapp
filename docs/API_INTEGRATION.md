# API Integration Guide

## Overview
This guide documents the API integration patterns and best practices used in RecipeGram to ensure consistent error handling, data flow, and state management between frontend and backend.

## Table of Contents
1. [API Response Formats](#api-response-formats)
2. [Error Handling Patterns](#error-handling-patterns)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Flow](#data-flow)
5. [Testing](#testing)

## API Response Formats

### Successful Responses

#### Posts
```javascript
// GET /posts - Paginated posts
{
  "page": 1,
  "limit": 10,
  "total": 100,
  "totalPages": 10,
  "posts": [...]
}

// GET /posts/:id - Single post
{
  "_id": "...",
  "caption": "...",
  "image": "...",
  "author": {
    "_id": "...",
    "username": "...",
    "profileImage": "..."
  },
  "likesCount": 0,
  "commentsCount": 0,
  "ingredients": [...],
  "steps": [...],
  "createdAt": "...",
  "updatedAt": "..."
}

// POST /posts - Create post
{
  "message": "Post created successfully",
  "post": {...}
}
```

#### Comments
```javascript
// GET /comments/:postId - Get comments
{
  "comments": [
    {
      "_id": "...",
      "text": "...",
      "user": {
        "_id": "...",
        "username": "...",
        "profileImage": "..."
      },
      "createdAt": "..."
    }
  ]
}

// POST /comments/:postId - Add comment
{
  "message": "Comment added",
  "comment": {
    "_id": "...",
    "text": "...",
    "user": {...}
  }
}
```

#### Likes
```javascript
// POST /likes/:postId - Toggle like
{
  "message": "Post liked" // or "Post unliked"
}

// GET /likes/:postId/check - Check if liked
{
  "isLiked": true
}

// GET /likes/:postId - Get all likes
{
  "likes": [
    {
      "_id": "...",
      "user": {
        "_id": "...",
        "username": "...",
        "profileImage": "..."
      }
    }
  ]
}
```

### Error Responses

All errors follow a consistent format:
```javascript
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Internal Server Error

## Error Handling Patterns

### Frontend Error Handling

#### Component-Level Error Handling
```javascript
const [error, setError] = useState(null);

try {
  const response = await apiService.someAction();
  // Handle success
} catch (error) {
  console.error('Error:', error);
  setError(error.response?.data?.message || 'Operation failed');
  // Optional: Auto-clear error after timeout
  setTimeout(() => setError(null), 3000);
}

// Display error in UI
{error && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
    {error}
  </div>
)}
```

#### API Service Error Handling
The axios interceptor in `/client/src/services/api.js` handles:
- Automatic token attachment
- Response data extraction
- Error logging and formatting

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

### Backend Error Handling

#### Controller Error Pattern
```javascript
export const someController = async (req, res) => {
  try {
    // Validation
    if (!requiredField) {
      return res.status(400).json({ message: "Field is required" });
    }

    // Authorization
    if (resource.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Business logic
    const result = await Model.create(data);
    
    res.status(201).json({ message: "Success", data: result });
  } catch (err) {
    console.error("Controller error:", err);
    res.status(500).json({ message: "Failed to perform action" });
  }
};
```

#### Validation Middleware
Input validation is centralized in `/server/src/middleware/validation.middleware.js`:
```javascript
export const validatePost = (req, res, next) => {
  const { caption, image } = req.body;
  
  if (!caption || caption.trim().length === 0) {
    return res.status(400).json({ message: "Caption is required" });
  }
  
  if (!image || !isValidUrl(image)) {
    return res.status(400).json({ message: "Valid image URL is required" });
  }
  
  next();
};
```

## Authentication & Authorization

### Authentication Flow

1. **Login/Register**: User receives JWT token
```javascript
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

2. **Frontend stores token**: Saved in Redux and localStorage
```javascript
localStorage.setItem('token', token);
```

3. **All requests include token**: Axios interceptor adds header
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

4. **Backend verifies token**: Auth middleware extracts user
```javascript
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.userId);
  next();
};
```

### Authorization Patterns

#### Resource Ownership
```javascript
// Check if user is the author
if (post.author.toString() !== req.user._id.toString()) {
  return res.status(403).json({ message: "Not authorized" });
}
```

#### Existence Check
```javascript
const post = await Post.findById(postId);
if (!post) {
  return res.status(404).json({ message: "Post not found" });
}
```

## Data Flow

### Creating a Post

1. **Frontend**: User submits post form
```javascript
const { createPost } = usePosts();
const result = await createPost(postData);
if (result.success) {
  // Post added to Redux store automatically
  navigate('/');
}
```

2. **Redux**: Optimistic update
```javascript
addPost: (state, action) => {
  state.posts = [action.payload, ...state.posts];
}
```

3. **Backend**: Create and populate
```javascript
const post = await Post.create(data);
await post.populate("author", "username profileImage");
res.status(201).json({ message: "Post created", post });
```

### Like/Unlike Flow

1. **Frontend**: Toggle button clicked
```javascript
const handleLike = async () => {
  await likeService.toggleLike(postId);
  if (isLiked) {
    setLikesCount(prev => Math.max(0, prev - 1));
  } else {
    setLikesCount(prev => prev + 1);
  }
  setIsLiked(!isLiked);
};
```

2. **Backend**: Check existing like and toggle
```javascript
const existingLike = await Like.findOne({ user: req.user._id, post: postId });
if (existingLike) {
  await existingLike.deleteOne();
  await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
  return res.json({ message: "Post unliked" });
}
// Create new like...
```

### Comment Flow

1. **Frontend**: Submit comment
```javascript
const response = await commentService.addComment(postId, text);
setComments([response.data.comment, ...comments]);
```

2. **Backend**: Create comment and update count
```javascript
const comment = await Comment.create({ post: postId, user: req.user._id, text });
await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
await comment.populate("user", "username profileImage");
res.status(201).json({ message: "Comment added", comment });
```

## Safety Checks

### Frontend Array Safety
Always ensure arrays are defined before accessing:
```javascript
// Safe posts access
const safePosts = posts || [];

// Safe array checks
{loading && safePosts.length === 0 ? <Loading /> : null}
{safePosts.map(post => <PostCard key={post._id} post={post} />)}
```

### Backend Null Checks
```javascript
// Check existence before operations
if (!post) {
  return res.status(404).json({ message: "Post not found" });
}

// Safe array operations
const ingredients = post.ingredients || [];
```

## Testing

### Frontend Tests (Vitest)
```bash
cd client
npm test              # Run all tests
npm run test:ui       # Run with UI
npm run test:coverage # With coverage
```

### Backend Tests (Jest)
```bash
cd server
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### Test Coverage
- Frontend: 37 tests covering components and Redux
- Backend: 29 tests covering API endpoints
- See `/docs/TESTING.md` for detailed test documentation

## Best Practices

1. **Always handle loading and error states**
2. **Use null-safe operators for nested objects**
3. **Validate input on both frontend and backend**
4. **Use consistent response formats**
5. **Populate related data in responses**
6. **Implement proper authorization checks**
7. **Log errors for debugging**
8. **Use TypeScript/PropTypes for type safety**
9. **Write tests for critical paths**
10. **Document API changes**
