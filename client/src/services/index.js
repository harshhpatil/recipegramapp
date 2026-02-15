import api from './api';

// Authentication services
export const authService = {
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// User services
export const userService = {
  getUserProfile: async (username) => {
    return await api.get(`/users/${username}`);
  },

  updateProfile: async (profileData) => {
    return await api.put('/users/profile', profileData);
  },

  getUserPosts: async (userId, page = 1) => {
    return await api.get(`/users/${userId}/posts?page=${page}`);
  },

  searchUsers: async (query, page = 1) => {
    return await api.get(`/users/search?q=${query}&page=${page}`);
  },
};

// Post services
export const postService = {
  getAllPosts: async (page = 1) => {
    return await api.get(`/posts?page=${page}`);
  },

  getPostById: async (postId) => {
    return await api.get(`/posts/${postId}`);
  },

  createPost: async (postData) => {
    return await api.post('/posts', postData);
  },

  updatePost: async (postId, postData) => {
    return await api.put(`/posts/${postId}`, postData);
  },

  deletePost: async (postId) => {
    return await api.delete(`/posts/${postId}`);
  },

  getFeed: async (page = 1) => {
    return await api.get(`/posts/feed?page=${page}`);
  },
};

// Like services
export const likeService = {
  likePost: async (postId) => {
    return await api.post(`/likes/${postId}`);
  },

  unlikePost: async (postId) => {
    return await api.delete(`/likes/${postId}`);
  },

  checkIfLiked: async (postId) => {
    return await api.get(`/likes/${postId}/check`);
  },
};

// Comment services
export const commentService = {
  getComments: async (postId) => {
    return await api.get(`/comments/${postId}`);
  },

  addComment: async (postId, content) => {
    return await api.post(`/comments/${postId}`, { content });
  },

  deleteComment: async (commentId) => {
    return await api.delete(`/comments/${commentId}`);
  },
};

// Follow services
export const followService = {
  followUser: async (userId) => {
    return await api.post(`/follow/${userId}`);
  },

  unfollowUser: async (userId) => {
    return await api.delete(`/follow/${userId}`);
  },

  getFollowers: async (userId) => {
    return await api.get(`/follow/${userId}/followers`);
  },

  getFollowing: async (userId) => {
    return await api.get(`/follow/${userId}/following`);
  },
};

// Save services
export const saveService = {
  savePost: async (postId) => {
    return await api.post(`/save/${postId}`);
  },

  unsavePost: async (postId) => {
    return await api.delete(`/save/${postId}`);
  },

  getSavedPosts: async () => {
    return await api.get('/save');
  },
};

// Notification services
export const notificationService = {
  getNotifications: async () => {
    return await api.get('/api/notifications');
  },

  markAsRead: async (notificationId) => {
    return await api.put(`/api/notifications/${notificationId}/read`);
  },

  markAllAsRead: async () => {
    return await api.put('/api/notifications/read-all');
  },
};

export default {
  auth: authService,
  user: userService,
  post: postService,
  like: likeService,
  comment: commentService,
  follow: followService,
  save: saveService,
  notification: notificationService,
};
