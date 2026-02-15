import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  feedPosts: [],
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    fetchFeedStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFeedSuccess: (state, action) => {
      state.loading = false;
      state.feedPosts = action.payload.reset 
        ? action.payload.posts 
        : [...state.feedPosts, ...action.payload.posts];
      state.hasMore = action.payload.hasMore;
      state.page = action.payload.page;
    },
    fetchFeedFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateFeedPost: (state, action) => {
      const index = state.feedPosts.findIndex(post => post._id === action.payload._id);
      if (index !== -1) {
        state.feedPosts[index] = action.payload;
      }
    },
    removeFeedPost: (state, action) => {
      state.feedPosts = state.feedPosts.filter(post => post._id !== action.payload);
    },
    clearFeed: (state) => {
      state.feedPosts = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
});

export const {
  fetchFeedStart,
  fetchFeedSuccess,
  fetchFeedFailure,
  updateFeedPost,
  removeFeedPost,
  clearFeed,
} = feedSlice.actions;

export default feedSlice.reducer;
