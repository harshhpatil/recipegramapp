import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateCachedUserFollowStatus } from '../store/slices/userSlice';
import { updateAuthorFollowStatus } from '../store/slices/postSlice';
import { updateFeedAuthorFollowStatus } from '../store/slices/feedSlice';
import { followService } from '../services';
import { useToast } from '../context/ToastContext';

export const useFollow = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const toggleFollow = useCallback(async (userId, isCurrentlyFollowing) => {
    try {
      // Backend uses POST /follow/:userId for toggle
      await followService.followUser(userId);

      const newFollowStatus = !isCurrentlyFollowing;

      // Update Redux state across all slices for proper synchronization
      dispatch(updateCachedUserFollowStatus({
        userId,
        isFollowing: newFollowStatus
      }));

      dispatch(updateAuthorFollowStatus({
        userId,
        isFollowing: newFollowStatus
      }));

      dispatch(updateFeedAuthorFollowStatus({
        userId,
        isFollowing: newFollowStatus
      }));

      showToast(
        isCurrentlyFollowing ? 'User unfollowed' : 'User followed',
        'success'
      );

      return { success: true, isFollowing: newFollowStatus };
    } catch (error) {
      showToast(error.message || 'Follow action failed', 'error');
      return { success: false, error: error.message };
    }
  }, [dispatch, showToast]);

  return { toggleFollow };
};
