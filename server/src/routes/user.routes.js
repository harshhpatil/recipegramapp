import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  getUserPosts,
  searchUsers 
} from '../controller/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get user profile (public)
router.get('/:username', getUserProfile);

// Update user profile (authenticated)
router.put('/profile', authenticate, updateUserProfile);

// Get user's posts
router.get('/:userId/posts', getUserPosts);

// Search users
router.get('/search', searchUsers);

export default router;
