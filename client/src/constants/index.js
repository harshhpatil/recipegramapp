// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    PROFILE: '/users',
    SEARCH: '/users/search',
    UPDATE: '/users/profile',
  },
  POSTS: {
    ALL: '/posts',
    FEED: '/posts/feed',
    CREATE: '/posts',
    UPDATE: (id) => `/posts/${id}`,
    DELETE: (id) => `/posts/${id}`,
    BY_ID: (id) => `/posts/${id}`,
  },
  LIKES: {
    LIKE: (postId) => `/likes/${postId}`,
    UNLIKE: (postId) => `/likes/${postId}`,
  },
  COMMENTS: {
    GET: (postId) => `/comments/${postId}`,
    ADD: (postId) => `/comments/${postId}`,
    DELETE: (id) => `/comments/${id}`,
  },
  FOLLOW: {
    FOLLOW: (userId) => `/follow/${userId}`,
    UNFOLLOW: (userId) => `/follow/${userId}`,
  },
  NOTIFICATIONS: {
    GET: '/api/notifications',
    MARK_READ: (id) => `/api/notifications/${id}/read`,
  },
};

// Application constants
export const APP_NAME = 'RecipeGram';
export const APP_DESCRIPTION = 'Share and discover amazing recipes';

// Pagination
export const POSTS_PER_PAGE = 12;
export const USERS_PER_PAGE = 10;

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'Please login to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

export default {
  API_ENDPOINTS,
  APP_NAME,
  APP_DESCRIPTION,
  POSTS_PER_PAGE,
  USERS_PER_PAGE,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  STORAGE_KEYS,
  ERROR_MESSAGES,
};
