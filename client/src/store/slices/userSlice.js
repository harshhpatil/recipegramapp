import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  userPosts: [], // Must remain an array
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUserSuccess: (state, action) => {
      state.loading = false;
      state.profile = action.payload || null;
    },
    fetchUserFailure: (state, action) => {
      state.loading = false;
      // Extract the message if action.payload is an error object
      state.error = action.payload?.message || action.payload || "User error";
    },
    fetchUserPostsSuccess: (state, action) => {
      state.loading = false;
      // GUARD: Ensure userPosts is NEVER set to undefined
      state.userPosts = Array.isArray(action.payload) ? action.payload : [];
    },
    clearUserProfile: (state) => {
      state.profile = null;
      state.userPosts = [];
    },
    updateFollowStatus: (state, action) => {
      if (state.profile) {
        // GUARD: Ensure followersCount exists before adding to it
        const currentCount = state.profile.followersCount || 0;
        state.profile.followersCount = action.payload.isFollowing 
          ? currentCount + 1 
          : Math.max(0, currentCount - 1);
      }
    },
    // Update any cached user data when follow status changes
    updateCachedUserFollowStatus: (state, action) => {
      const { userId, isFollowing } = action.payload;
      if (state.profile && state.profile._id === userId) {
        const currentCount = state.profile.followersCount || 0;
        state.profile.followersCount = isFollowing 
          ? currentCount + 1 
          : Math.max(0, currentCount - 1);
      }
    },
  },
});

export const {
  fetchUserStart,
  fetchUserSuccess,
  fetchUserFailure,
  fetchUserPostsSuccess,
  clearUserProfile,
  updateFollowStatus,
  updateCachedUserFollowStatus,
} = userSlice.actions;

export default userSlice.reducer;