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
      
      // --- DEBUGGING LOG ---
      // This will show you exactly what is coming from the server
      console.log(`[usePosts] Fetching page ${page}, reset: ${reset}`);
      console.log("API Response Data:", response.data);

      // 1. SAFE DATA CHECK
      // We ensure data is an array before calling .length
      // If your API wraps the array in an object (e.g., { posts: [] }), 
      // change this to: const postsArray = response.data?.posts || [];
      const postsArray = Array.isArray(response.data) ? response.data : [];

      dispatch(fetchPostsSuccess({
        posts: postsArray,
        hasMore: postsArray.length > 0, // Now safe!
        page,
        reset,
      }));

      return { success: true };
    } catch (error) {
      // 2. CATCH THE REAL ERROR
      // If the try block fails (like a network error), we capture it here.
      const errorMsg = error.response?.data?.message || error.message || "Failed to fetch posts";
      console.error("Hook Error Caught:", errorMsg);
      
      dispatch(fetchPostsFailure(errorMsg));
      return { success: false, error: errorMsg };
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