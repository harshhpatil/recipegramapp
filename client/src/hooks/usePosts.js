import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  addPost as addPostAction,
  updatePost as updatePostAction,
  deletePost as deletePostAction,
  likePost as likePostAction,
  unlikePost as unlikePostAction,
  addComment as addCommentAction,
} from '../store/slices/postSlice';
import { postService, likeService, commentService } from '../services';

export const usePosts = () => {
  const dispatch = useDispatch();

  const fetchPosts = useCallback(async (page = 1, reset = false) => {
    try {
      dispatch(fetchPostsStart());
      const response = await postService.getAllPosts(page);
      dispatch(fetchPostsSuccess({
        posts: response.data,
        hasMore: response.data.length > 0,
        page,
        reset,
      }));
      return { success: true };
    } catch (error) {
      dispatch(fetchPostsFailure(error.message));
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const createPost = useCallback(async (postData) => {
    try {
      const response = await postService.createPost(postData);
      dispatch(addPostAction(response.data));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const updatePost = useCallback(async (postId, postData) => {
    try {
      const response = await postService.updatePost(postId, postData);
      dispatch(updatePostAction(response.data));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const deletePost = useCallback(async (postId) => {
    try {
      await postService.deletePost(postId);
      dispatch(deletePostAction(postId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const likePost = useCallback(async (postId) => {
    try {
      await likeService.likePost(postId);
      dispatch(likePostAction({ postId }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const unlikePost = useCallback(async (postId) => {
    try {
      await likeService.unlikePost(postId);
      dispatch(unlikePostAction({ postId }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const addComment = useCallback(async (postId, content) => {
    try {
      await commentService.addComment(postId, content);
      dispatch(addCommentAction({ postId }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  return {
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    addComment,
  };
};
