import request from 'supertest';
import app from '../app.js';
import User from '../models/User.model.js';
import Post from '../models/Post.model.js';
import Comment from '../models/Comment.model.js';
import jwt from 'jsonwebtoken';
import { connectTestDB, closeTestDB, clearTestDB } from './testSetup.js';

describe('Comment API Endpoints', () => {
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
      commentsCount: 0,
    });
    
    authToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );
  });

  describe('POST /comments/:postId', () => {
    it('should add a comment to a post', async () => {
      const commentData = { text: 'Great recipe!' };

      const response = await request(app)
        .post(`/comments/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData)
        .expect(201);

      expect(response.body.comment).toBeDefined();
      expect(response.body.comment.text).toBe('Great recipe!');
      expect(response.body.comment.user).toBeDefined();
      expect(response.body.comment.user.username).toBe('testuser');

      // Check that commentsCount was incremented
      const updatedPost = await Post.findById(testPost._id);
      expect(updatedPost.commentsCount).toBe(1);
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .post(`/comments/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Comment' })
        .expect(404);
    });

    it('should return 400 if text is missing', async () => {
      await request(app)
        .post(`/comments/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .post(`/comments/${testPost._id}`)
        .send({ text: 'Comment' })
        .expect(401);
    });
  });

  describe('GET /comments/:postId', () => {
    beforeEach(async () => {
      await Comment.create([
        {
          post: testPost._id,
          user: testUser._id,
          text: 'Comment 1',
        },
        {
          post: testPost._id,
          user: testUser._id,
          text: 'Comment 2',
        },
      ]);
    });

    it('should return all comments for a post', async () => {
      const response = await request(app)
        .get(`/comments/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.comments).toBeDefined();
      expect(Array.isArray(response.body.comments)).toBe(true);
      expect(response.body.comments.length).toBe(2);
    });

    it('should populate user data in comments', async () => {
      const response = await request(app)
        .get(`/comments/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.comments[0].user).toBeDefined();
      expect(response.body.comments[0].user.username).toBe('testuser');
    });

    it('should return empty array for post with no comments', async () => {
      const newPost = await Post.create({
        caption: 'New Post',
        image: 'https://example.com/new.jpg',
        author: testUser._id,
      });

      const response = await request(app)
        .get(`/comments/${newPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.comments).toEqual([]);
    });
  });

  describe('DELETE /comments/:commentId', () => {
    let testComment;

    beforeEach(async () => {
      testComment = await Comment.create({
        post: testPost._id,
        user: testUser._id,
        text: 'Test comment',
      });

      await Post.findByIdAndUpdate(testPost._id, {
        $inc: { commentsCount: 1 },
      });
    });

    it('should delete comment if user is author', async () => {
      await request(app)
        .delete(`/comments/${testComment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deletedComment = await Comment.findById(testComment._id);
      expect(deletedComment).toBeNull();

      // Check that commentsCount was decremented
      const updatedPost = await Post.findById(testPost._id);
      expect(updatedPost.commentsCount).toBe(0);
    });

    it('should return 403 if user is not author', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
      });

      const otherToken = jwt.sign(
        { id: otherUser._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '7d' }
      );

      await request(app)
        .delete(`/comments/${testComment._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent comment', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .delete(`/comments/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
