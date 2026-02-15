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
      state.posts = action.payload.reset 
        ? action.payload.posts 
        : [...state.posts, ...action.payload.posts];
      state.hasMore = action.payload.hasMore;
      state.page = action.payload.page;
    },
    fetchPostsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentPost: (state, action) => {
      state.currentPost = action.payload;
    },
    addPost: (state, action) => {
      state.posts = [action.payload, ...state.posts];
    },
    updatePost: (state, action) => {
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
        post.likesCount += 1;
      }
      if (state.currentPost?._id === postId) {
        state.currentPost.likesCount += 1;
      }
    },
    unlikePost: (state, action) => {
      const { postId } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        post.likesCount -= 1;
      }
      if (state.currentPost?._id === postId) {
        state.currentPost.likesCount -= 1;
      }
    },
    addComment: (state, action) => {
      const { postId } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        post.commentsCount += 1;
      }
      if (state.currentPost?._id === postId) {
        state.currentPost.commentsCount += 1;
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
