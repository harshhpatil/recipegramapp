import { describe, it, expect } from 'vitest';
import postReducer, {
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  addPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  clearPosts,
} from './postSlice';

describe('postSlice', () => {
  const initialState = {
    posts: [],
    currentPost: null,
    loading: false,
    error: null,
    hasMore: true,
    page: 1,
  };

  it('should return initial state', () => {
    expect(postReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('fetchPosts actions', () => {
    it('should handle fetchPostsStart', () => {
      const state = postReducer(initialState, fetchPostsStart());
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle fetchPostsSuccess with reset', () => {
      const posts = [
        { _id: '1', caption: 'Post 1' },
        { _id: '2', caption: 'Post 2' },
      ];
      const state = postReducer(
        initialState,
        fetchPostsSuccess({ posts, hasMore: true, page: 1, reset: true })
      );
      
      expect(state.loading).toBe(false);
      expect(state.posts).toEqual(posts);
      expect(state.hasMore).toBe(true);
      expect(state.page).toBe(1);
    });

    it('should handle fetchPostsSuccess without reset (append)', () => {
      const existingPosts = [{ _id: '1', caption: 'Post 1' }];
      const newPosts = [{ _id: '2', caption: 'Post 2' }];
      const stateWithPosts = { ...initialState, posts: existingPosts };
      
      const state = postReducer(
        stateWithPosts,
        fetchPostsSuccess({ posts: newPosts, hasMore: true, page: 2, reset: false })
      );
      
      expect(state.posts).toEqual([...existingPosts, ...newPosts]);
      expect(state.page).toBe(2);
    });

    it('should handle fetchPostsFailure', () => {
      const error = 'Failed to fetch posts';
      const state = postReducer(initialState, fetchPostsFailure(error));
      
      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('post CRUD actions', () => {
    it('should handle addPost', () => {
      const newPost = { _id: '3', caption: 'New Post' };
      const state = postReducer(initialState, addPost(newPost));
      
      expect(state.posts).toEqual([newPost]);
    });

    it('should handle updatePost', () => {
      const posts = [
        { _id: '1', caption: 'Post 1' },
        { _id: '2', caption: 'Post 2' },
      ];
      const stateWithPosts = { ...initialState, posts };
      const updatedPost = { _id: '2', caption: 'Updated Post 2' };
      
      const state = postReducer(stateWithPosts, updatePost(updatedPost));
      
      expect(state.posts[1]).toEqual(updatedPost);
    });

    it('should handle updatePost for currentPost', () => {
      const currentPost = { _id: '1', caption: 'Current Post' };
      const stateWithCurrentPost = { ...initialState, currentPost };
      const updatedPost = { _id: '1', caption: 'Updated Current Post' };
      
      const state = postReducer(stateWithCurrentPost, updatePost(updatedPost));
      
      expect(state.currentPost).toEqual(updatedPost);
    });

    it('should handle deletePost', () => {
      const posts = [
        { _id: '1', caption: 'Post 1' },
        { _id: '2', caption: 'Post 2' },
      ];
      const stateWithPosts = { ...initialState, posts };
      
      const state = postReducer(stateWithPosts, deletePost('2'));
      
      expect(state.posts).toHaveLength(1);
      expect(state.posts[0]._id).toBe('1');
    });

    it('should handle deletePost for currentPost', () => {
      const currentPost = { _id: '1', caption: 'Current Post' };
      const stateWithCurrentPost = { ...initialState, currentPost };
      
      const state = postReducer(stateWithCurrentPost, deletePost('1'));
      
      expect(state.currentPost).toBe(null);
    });
  });

  describe('like actions', () => {
    it('should handle likePost', () => {
      const posts = [
        { _id: '1', caption: 'Post 1', likesCount: 5 },
        { _id: '2', caption: 'Post 2', likesCount: 10 },
      ];
      const stateWithPosts = { ...initialState, posts };
      
      const state = postReducer(stateWithPosts, likePost({ postId: '2' }));
      
      expect(state.posts[1].likesCount).toBe(11);
    });

    it('should handle likePost for currentPost', () => {
      const currentPost = { _id: '1', caption: 'Current Post', likesCount: 5 };
      const stateWithCurrentPost = { ...initialState, currentPost };
      
      const state = postReducer(stateWithCurrentPost, likePost({ postId: '1' }));
      
      expect(state.currentPost.likesCount).toBe(6);
    });

    it('should handle unlikePost', () => {
      const posts = [
        { _id: '1', caption: 'Post 1', likesCount: 5 },
        { _id: '2', caption: 'Post 2', likesCount: 10 },
      ];
      const stateWithPosts = { ...initialState, posts };
      
      const state = postReducer(stateWithPosts, unlikePost({ postId: '2' }));
      
      expect(state.posts[1].likesCount).toBe(9);
    });

    it('should handle unlikePost for currentPost', () => {
      const currentPost = { _id: '1', caption: 'Current Post', likesCount: 5 };
      const stateWithCurrentPost = { ...initialState, currentPost };
      
      const state = postReducer(stateWithCurrentPost, unlikePost({ postId: '1' }));
      
      expect(state.currentPost.likesCount).toBe(4);
    });
  });

  describe('comment actions', () => {
    it('should handle addComment', () => {
      const posts = [
        { _id: '1', caption: 'Post 1', commentsCount: 3 },
        { _id: '2', caption: 'Post 2', commentsCount: 7 },
      ];
      const stateWithPosts = { ...initialState, posts };
      
      const state = postReducer(stateWithPosts, addComment({ postId: '2' }));
      
      expect(state.posts[1].commentsCount).toBe(8);
    });

    it('should handle addComment for currentPost', () => {
      const currentPost = { _id: '1', caption: 'Current Post', commentsCount: 3 };
      const stateWithCurrentPost = { ...initialState, currentPost };
      
      const state = postReducer(stateWithCurrentPost, addComment({ postId: '1' }));
      
      expect(state.currentPost.commentsCount).toBe(4);
    });
  });

  describe('clearPosts', () => {
    it('should handle clearPosts', () => {
      const posts = [
        { _id: '1', caption: 'Post 1' },
        { _id: '2', caption: 'Post 2' },
      ];
      const stateWithPosts = { ...initialState, posts, page: 3, hasMore: false };
      
      const state = postReducer(stateWithPosts, clearPosts());
      
      expect(state.posts).toEqual([]);
      expect(state.page).toBe(1);
      expect(state.hasMore).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle actions on non-existent posts gracefully', () => {
      const posts = [{ _id: '1', caption: 'Post 1', likesCount: 5 }];
      const stateWithPosts = { ...initialState, posts };
      
      // Try to like a post that doesn't exist
      const state = postReducer(stateWithPosts, likePost({ postId: '999' }));
      
      // Should not crash, posts should remain unchanged
      expect(state.posts).toEqual(posts);
    });

    it('should handle empty posts array', () => {
      const state = postReducer(initialState, likePost({ postId: '1' }));
      
      // Should not crash
      expect(state.posts).toEqual([]);
    });
  });
});
