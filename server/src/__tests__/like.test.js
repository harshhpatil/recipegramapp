import request from 'supertest';
import app from '../app.js';
import User from '../models/User.model.js';
import Post from '../models/Post.model.js';
import Like from '../models/Like.model.js';
import jwt from 'jsonwebtoken';
import { connectTestDB, closeTestDB, clearTestDB } from './testSetup.js';

describe('Like API Endpoints', () => {
  let authToken;
  let testUser;
  let testPost;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword123',
    });
    
    testPost = await Post.create({
      caption: 'Test Post',
      image: 'https://example.com/test.jpg',
      author: testUser._id,
      likesCount: 0,
    });
    
    authToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );
  });

  describe('POST /likes/:postId (toggle like)', () => {
    it('should like a post that is not liked', async () => {
      const response = await request(app)
        .post(`/likes/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toContain('liked');

      // Check that like was created
      const like = await Like.findOne({ user: testUser._id, post: testPost._id });
      expect(like).toBeDefined();

      // Check that likesCount was incremented
      const updatedPost = await Post.findById(testPost._id);
      expect(updatedPost.likesCount).toBe(1);
    });

    it('should unlike a post that is already liked', async () => {
      // First, like the post
      await Like.create({ user: testUser._id, post: testPost._id });
      await Post.findByIdAndUpdate(testPost._id, { $inc: { likesCount: 1 } });

      const response = await request(app)
        .post(`/likes/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toContain('unliked');

      // Check that like was removed
      const like = await Like.findOne({ user: testUser._id, post: testPost._id });
      expect(like).toBeNull();

      // Check that likesCount was decremented
      const updatedPost = await Post.findById(testPost._id);
      expect(updatedPost.likesCount).toBe(0);
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .post(`/likes/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .post(`/likes/${testPost._id}`)
        .expect(401);
    });
  });

  describe('GET /likes/:postId/check', () => {
    it('should return false if post is not liked', async () => {
      const response = await request(app)
        .get(`/likes/${testPost._id}/check`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.isLiked).toBe(false);
    });

    it('should return true if post is liked', async () => {
      await Like.create({ user: testUser._id, post: testPost._id });

      const response = await request(app)
        .get(`/likes/${testPost._id}/check`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.isLiked).toBe(true);
    });
  });

  describe('GET /likes/:postId (get all likes)', () => {
    beforeEach(async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
      });

      await Like.create([
        { user: testUser._id, post: testPost._id },
        { user: otherUser._id, post: testPost._id },
      ]);
    });

    it('should return all likes for a post', async () => {
      const response = await request(app)
        .get(`/likes/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.likes).toBeDefined();
      expect(Array.isArray(response.body.likes)).toBe(true);
      expect(response.body.likes.length).toBe(2);
    });

    it('should populate user data in likes', async () => {
      const response = await request(app)
        .get(`/likes/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.likes[0].user).toBeDefined();
      expect(response.body.likes[0].user.username).toBeDefined();
    });
  });
});
