import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  userPosts: [],
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
      state.profile = action.payload;
    },
    fetchUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchUserPostsSuccess: (state, action) => {
      state.userPosts = action.payload;
    },
    clearUserProfile: (state) => {
      state.profile = null;
      state.userPosts = [];
    },
    updateFollowStatus: (state, action) => {
      if (state.profile) {
        state.profile.followersCount += action.payload.isFollowing ? 1 : -1;
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
} = userSlice.actions;

export default userSlice.reducer;
