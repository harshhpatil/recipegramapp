import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  getUserPosts,
  searchUsers 
} from '../controller/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { searchLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

// Search users (must be before /:username)
router.get('/search', searchLimiter, searchUsers);

// Update user profile (authenticated)
router.put('/profile', authenticate, updateUserProfile);

// Get user's posts
router.get('/:userId/posts', getUserPosts);

// Get user profile (public) - must be last to avoid matching other routes
router.get('/:username', getUserProfile);

export default router;
