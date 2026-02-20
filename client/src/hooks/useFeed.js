import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  fetchFeedStart,
  fetchFeedSuccess,
  fetchFeedFailure,
  updateFeedPost,
  removeFeedPost,
} from '../store/slices/feedSlice';
import { postService } from '../services';

/**
 * Hook for managing personalized feed (posts from followed users)
 * Use this for the Home page instead of usePosts
 */
export const useFeed = () => {
  const dispatch = useDispatch();

  const fetchFeed = useCallback(async (page = 1, reset = false) => {
    try {
      dispatch(fetchFeedStart());
      
      const response = await postService.getFeed(page);
      
      console.log(`[useFeed] Fetching feed page ${page}, reset: ${reset}`);
      console.log("Feed API Response:", response);

      // Backend returns { page, limit, total, totalPages, posts }
      const postsArray = response.data?.posts || response.posts || [];
      const hasMore = response.data?.page < response.data?.totalPages || false;

      dispatch(fetchFeedSuccess({
        posts: postsArray,
        hasMore: hasMore,
        page: response.data?.page || page,
        reset,
      }));

      return { success: true, posts: postsArray };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to fetch feed";
      console.error("Feed Hook Error:", errorMsg);
      
      dispatch(fetchFeedFailure(errorMsg));
      return { success: false, error: errorMsg };
    }
  }, [dispatch]);

  const updatePost = useCallback((post) => {
    dispatch(updateFeedPost(post));
  }, [dispatch]);

  const removePost = useCallback((postId) => {
    dispatch(removeFeedPost(postId));
  }, [dispatch]);

  return {
    fetchFeed,
    updatePost,
    removePost,
  };
};
