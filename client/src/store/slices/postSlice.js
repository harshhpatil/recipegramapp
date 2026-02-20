import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    fetchPostsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPostsSuccess: (state, action) => {
      state.loading = false;
      
      // SAFETY CHECK: Ensure action.payload and action.payload.posts exist
      const incomingPosts = action.payload?.posts || [];
      
      state.posts = action.payload?.reset 
        ? incomingPosts 
        : [...state.posts, ...incomingPosts];
        
      state.hasMore = action.payload?.hasMore ?? false;
      state.page = action.payload?.page || state.page;
    },
    fetchPostsFailure: (state, action) => {
      state.loading = false;
      // If action.payload is an object, try to get the message
      state.error = action.payload?.message || action.payload || "An unknown error occurred";
    },
    setCurrentPost: (state, action) => {
      state.currentPost = action.payload;
    },
    addPost: (state, action) => {
      state.posts = [action.payload, ...state.posts];
    },
    updatePost: (state, action) => {
      if (!action.payload?._id) return;
      const index = state.posts.findIndex(post => post._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
      if (state.currentPost?._id === action.payload._id) {
        state.currentPost = action.payload;
      }
    },
    deletePost: (state, action) => {
      state.posts = state.posts.filter(post => post._id !== action.payload);
      if (state.currentPost?._id === action.payload) {
        state.currentPost = null;
      }
    },
    likePost: (state, action) => {
      const { postId } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        post.likesCount = (post.likesCount || 0) + 1;
      }
      if (state.currentPost?._id === postId) {
        state.currentPost.likesCount = (state.currentPost.likesCount || 0) + 1;
      }
    },
    unlikePost: (state, action) => {
      const { postId } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        post.likesCount = Math.max(0, (post.likesCount || 0) - 1);
      }
      if (state.currentPost?._id === postId) {
        state.currentPost.likesCount = Math.max(0, (state.currentPost.likesCount || 0) - 1);
      }
    },
    addComment: (state, action) => {
      const { postId } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        post.commentsCount = (post.commentsCount || 0) + 1;
      }
      if (state.currentPost?._id === postId) {
        state.currentPost.commentsCount = (state.currentPost.commentsCount || 0) + 1;
      }
    },
    clearPosts: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
});

export const {
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  setCurrentPost,
  addPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  clearPosts,
} = postSlice.actions;

export default postSlice.reducer;