# Debugging Guide

## Overview
This guide provides systematic approaches to debugging common issues in RecipeGram, including frontend errors, backend issues, and integration problems.

## Table of Contents
1. [Common Frontend Issues](#common-frontend-issues)
2. [Common Backend Issues](#common-backend-issues)
3. [Integration Issues](#integration-issues)
4. [Debugging Tools](#debugging-tools)
5. [Error Messages Reference](#error-messages-reference)

## Common Frontend Issues

### Issue 1: "Cannot read properties of undefined (reading 'length')"

**Symptom**: App crashes when trying to access array properties

**Root Cause**: State array is undefined instead of empty array

**Solution**:
```javascript
// ❌ Bad - Can crash if posts is undefined
{posts.length === 0 ? <Empty /> : <List />}

// ✅ Good - Safe with undefined
const safePosts = posts || [];
{safePosts.length === 0 ? <Empty /> : <List />}

// ✅ Good - Optional chaining
{posts?.length === 0 ? <Empty /> : <List />}
```

**Prevention**:
- Always initialize state with empty arrays: `useState([])`
- Use optional chaining for nested properties
- Add null checks before array operations
- Ensure Redux initial state has proper structure

### Issue 2: Like Button Not Updating

**Symptom**: Click like button but count doesn't change

**Debugging Steps**:

1. Check if API call is being made:
```javascript
const handleLike = async () => {
  console.log('Like button clicked, postId:', postId);
  try {
    const response = await likeService.toggleLike(postId);
    console.log('Like response:', response);
    // ...
  } catch (error) {
    console.error('Like error:', error);
  }
};
```

2. Verify state updates:
```javascript
setLikesCount(prev => {
  console.log('Previous likes:', prev, 'New likes:', prev + 1);
  return prev + 1;
});
```

3. Check if response format matches expectations:
```javascript
// Backend returns: { message: "Post liked" }
// Not: { likes: number }
```

**Common Causes**:
- Backend endpoint not working
- State not updating correctly
- Conflicting state management (local + Redux)
- Network errors not handled

**Solution**:
```javascript
const handleLike = async () => {
  try {
    await likeService.toggleLike(postId);
    // Optimistically update UI
    if (isLiked) {
      setLikesCount(prev => Math.max(0, prev - 1));
    } else {
      setLikesCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  } catch (error) {
    console.error('Error toggling like:', error);
    setError(error.response?.data?.message || 'Failed to toggle like');
  }
};
```

### Issue 3: Comments Not Displaying

**Symptom**: Comments array is empty or undefined

**Debugging Steps**:

1. Check API call:
```javascript
useEffect(() => {
  const fetchComments = async () => {
    try {
      const response = await commentService.getComments(postId);
      console.log('Comments response:', response);
      console.log('Comments data:', response.data);
      setComments(response.data?.comments || response.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };
  fetchComments();
}, [postId]);
```

2. Verify backend response format:
```javascript
// Expected: { comments: [...] }
// Check if it's { data: { comments: [...] } }
```

3. Check component props:
```javascript
const CommentSection = ({ comments }) => {
  console.log('CommentSection received comments:', comments);
  const safeComments = comments || [];
  // ...
};
```

**Solution**: Use defensive coding with fallbacks
```javascript
// In API call
setComments(response.data?.comments || response.comments || []);

// In component
const safeComments = comments || [];
{safeComments.map(comment => <CommentItem key={comment._id} comment={comment} />)}
```

### Issue 4: PostDetail Page Not Loading

**Symptom**: Loading spinner forever or blank page

**Debugging Steps**:

1. Check route parameter:
```javascript
const { postId } = useParams();
console.log('PostDetail postId:', postId);
```

2. Check API call:
```javascript
const response = await postService.getPostById(postId);
console.log('Post response:', response);
console.log('Post data:', response.data || response);
```

3. Check error handling:
```javascript
try {
  // API calls
} catch (error) {
  console.error('Error fetching post:', error);
  setError(error.response?.data?.message || 'Failed to load post');
} finally {
  setLoading(false); // ⚠️ Important - stops loading spinner
}
```

**Common Causes**:
- Missing postId in URL
- Backend endpoint returning 404
- Forgot to set loading to false
- Error state not displayed

## Common Backend Issues

### Issue 1: Authentication Errors (401 Unauthorized)

**Symptom**: All authenticated requests fail with 401

**Debugging Steps**:

1. Check JWT token generation:
```javascript
// In auth controller
const token = jwt.sign(
  { userId: user._id }, // ⚠️ Must be 'userId' not 'id'
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
console.log('Generated token:', token);
```

2. Check auth middleware:
```javascript
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader);
  
  const token = authHeader.split(' ')[1];
  console.log('Extracted token:', token);
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Decoded token:', decoded); // Should have { userId: ... }
  
  const user = await User.findById(decoded.userId);
  console.log('Found user:', user?._id);
  // ...
};
```

3. Check environment variable:
```bash
# .env file
JWT_SECRET=your-secret-key

# Verify it's loaded
console.log('JWT_SECRET:', process.env.JWT_SECRET);
```

### Issue 2: Authorization Errors (403 Forbidden)

**Symptom**: Cannot edit/delete own posts

**Debugging Steps**:

1. Check author comparison:
```javascript
console.log('Post author:', post.author.toString());
console.log('Current user:', req.user._id.toString());
console.log('Match:', post.author.toString() === req.user._id.toString());

if (post.author.toString() !== req.user._id.toString()) {
  return res.status(403).json({ message: "Not authorized" });
}
```

**Common Issues**:
- Not converting ObjectId to string for comparison
- User object structure mismatch
- Post not populated correctly

### Issue 3: Data Not Populated

**Symptom**: Author data missing or returns just ID

**Debugging Steps**:

1. Check population in query:
```javascript
// ❌ Bad - Author will be just an ObjectId
const post = await Post.findById(id);

// ✅ Good - Author will be full user object
const post = await Post.findById(id)
  .populate('author', 'username profileImage');

console.log('Post author:', post.author);
```

2. Verify model references:
```javascript
// Post model
author: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User', // ⚠️ Must match User model name exactly
  required: true
}
```

### Issue 4: Counts Not Updating

**Symptom**: likesCount or commentsCount stays at 0

**Debugging Steps**:

1. Check increment operation:
```javascript
// When adding like/comment
await Post.findByIdAndUpdate(postId, {
  $inc: { likesCount: 1 }
});
console.log('Incremented likesCount');

// Verify update
const updatedPost = await Post.findById(postId);
console.log('Updated likesCount:', updatedPost.likesCount);
```

2. Check decrement on delete:
```javascript
// When removing like/comment
await Post.findByIdAndUpdate(postId, {
  $inc: { likesCount: -1 }
});
```

### Issue 5: Cascade Delete Not Working

**Symptom**: Orphaned comments/likes after post deletion

**Solution**: Ensure cascade deletes are implemented
```javascript
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete post
    await Post.findByIdAndDelete(id);
    
    // ⚠️ Important - Cascade delete related data
    await Comment.deleteMany({ post: id });
    await Like.deleteMany({ post: id });
    
    // Also clean up from user's saved posts
    await User.updateMany(
      { savedPosts: id },
      { $pull: { savedPosts: id } }
    );
    
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};
```

## Integration Issues

### Issue 1: CORS Errors

**Symptom**: "blocked by CORS policy" in browser console

**Solution**:
```javascript
// server/src/middleware/cors.middleware.js
import cors from 'cors';

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
};

export default cors(corsOptions);
```

### Issue 2: API Base URL Mismatch

**Symptom**: API calls go to wrong URL

**Check**:
```javascript
// client/src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
console.log('API Base URL:', API_BASE_URL);

// .env
VITE_API_URL=http://localhost:3000
```

### Issue 3: Response Format Inconsistency

**Symptom**: Sometimes data is in `response.data`, sometimes in `response`

**Root Cause**: Axios interceptor extracts data, but not all services use it

**Solution**: Be consistent
```javascript
// api.js interceptor
api.interceptors.response.use(
  (response) => response, // Return full response, let services handle
  (error) => Promise.reject(error)
);

// Service
export const postService = {
  getPostById: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data; // Extract data in service
  }
};

// Component
const response = await postService.getPostById(id);
const post = response.data || response; // Handle both cases
```

## Debugging Tools

### Frontend Tools

#### React DevTools
```bash
# Install React DevTools browser extension
# Inspect component props, state, hooks
```

#### Redux DevTools
```javascript
// Already configured in store
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: rootReducer,
  // DevTools enabled automatically in development
});
```

#### Console Logging
```javascript
// Log component renders
console.log('[Home] Rendering with posts:', posts);

// Log API calls
console.log('[API] Calling getPostById:', postId);
console.log('[API] Response:', response);

// Log state changes
useEffect(() => {
  console.log('[Home] Posts changed:', posts);
}, [posts]);
```

#### Network Tab
- Check request headers (Authorization token)
- Verify response status codes
- Inspect response bodies
- Check CORS headers

### Backend Tools

#### Logging
```javascript
// Add timestamps to logs
console.log(`[${new Date().toISOString()}] User ${req.user._id} creating post`);

// Log request details
console.log('Request:', {
  method: req.method,
  url: req.url,
  body: req.body,
  user: req.user?._id,
});

// Log database queries
const post = await Post.findById(id);
console.log('Found post:', post?._id);
```

#### Postman/Thunder Client
Test API endpoints independently:
```http
POST http://localhost:3000/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "caption": "Test post",
  "image": "https://example.com/image.jpg"
}
```

#### MongoDB Compass
- Connect to database
- Inspect collections
- Verify data structure
- Check indexes

## Error Messages Reference

### Frontend Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Cannot read property 'X' of undefined | Accessing property of undefined object | Add null checks or optional chaining |
| Maximum update depth exceeded | Infinite render loop | Check useEffect dependencies |
| Objects are not valid as React child | Trying to render object directly | Convert to string or extract properties |
| Network Error | Backend not running or CORS issue | Start backend, check CORS config |
| 401 Unauthorized | Token missing/invalid | Check localStorage token, re-login |

### Backend Errors

| Error | Cause | Solution |
|-------|-------|----------|
| JsonWebTokenError | Invalid token | Check JWT_SECRET, token format |
| ValidationError | Mongoose validation failed | Check required fields, data types |
| CastError | Invalid ObjectId | Validate ID format before query |
| E11000 duplicate key | Unique constraint violation | Check for existing record first |
| Cannot read property 'X' of null | Document not found | Add existence check |

## Debugging Checklist

### When adding new feature:
- [ ] Add error handling (try/catch)
- [ ] Add loading states
- [ ] Add null/undefined checks
- [ ] Test with empty data
- [ ] Test with invalid data
- [ ] Check console for errors
- [ ] Test authorization
- [ ] Write tests

### When fixing bug:
- [ ] Reproduce the bug
- [ ] Write a failing test
- [ ] Add console.logs to trace issue
- [ ] Check network requests
- [ ] Verify data formats
- [ ] Fix the code
- [ ] Verify test passes
- [ ] Remove debug logs
- [ ] Test manually

### Before deployment:
- [ ] All tests passing
- [ ] No console errors
- [ ] No console warnings
- [ ] Error boundaries working
- [ ] 404 pages working
- [ ] Loading states working
- [ ] Error messages user-friendly
- [ ] Check production env vars

## Getting Help

### Steps to get help:
1. Check this debugging guide
2. Search error message in issues
3. Check API documentation
4. Review test examples
5. Ask with:
   - Error message
   - Code snippet
   - Steps to reproduce
   - Expected vs actual behavior
   - Console logs
   - Network requests

### Useful Resources
- [React Error Decoder](https://react.dev/errors)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [MDN Web Docs](https://developer.mozilla.org/)
