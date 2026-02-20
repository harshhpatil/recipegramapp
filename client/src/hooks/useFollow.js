import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateFollowStatus } from '../store/slices/userSlice';
import { followService } from '../services';
import { useToast } from '../context/ToastContext';

export const useFollow = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const toggleFollow = useCallback(async (userId, isCurrentlyFollowing) => {
    try {
      // Backend uses POST /follow/:userId for toggle
      await followService.followUser(userId);

      // Update Redux state
      dispatch(updateFollowStatus({
        isFollowing: !isCurrentlyFollowing
      }));

      showToast(
        isCurrentlyFollowing ? 'User unfollowed' : 'User followed',
        'success'
      );

      return { success: true, isFollowing: !isCurrentlyFollowing };
    } catch (error) {
      showToast(error.message || 'Follow action failed', 'error');
      return { success: false, error: error.message };
    }
  }, [dispatch, showToast]);

  return { toggleFollow };
};
