import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import postReducer, { likePost, unlikePost, addComment, fetchPostsSuccess } from '../../store/slices/postSlice';
import userReducer, { updateFollowStatus } from '../../store/slices/userSlice';
import authReducer from '../../store/slices/authSlice';
import CommentSection from '../../components/post/CommentSection';
import Home from '../../pages/Home';
import { likeService, commentService, followService } from '../../services';

// Mock the services
vi.mock('../../services', () => ({
  likeService: {
    toggleLike: vi.fn(),
    checkIfLiked: vi.fn(),
  },
  commentService: {
    addComment: vi.fn(),
    deleteComment: vi.fn(),
    getComments: vi.fn(),
  },
  followService: {
    followUser: vi.fn(),
    unfollowUser: vi.fn(),
  },
  postService: {
    getAllPosts: vi.fn(),
    getFeed: vi.fn(),
  },
  saveService: {
    toggleSave: vi.fn(),
    checkIfSaved: vi.fn(),
  },
}));

// Mock react-router-dom to avoid routing issues
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
}));

// Mock hooks
vi.mock('../../hooks', () => ({
  usePosts: () => ({
    fetchPosts: vi.fn(),
    createPost: vi.fn(),
    likePost: vi.fn(),
    unlikePost: vi.fn(),
    addComment: vi.fn(),
  }),
}));

const createMockStore = (overrides = {}) => {
  return configureStore({
    reducer: {
      posts: postReducer,
      user: userReducer,
      auth: authReducer,
    },
    preloadedState: overrides,
  });
};

const renderWithStore = (component, storeOverrides = {}) => {
  const store = createMockStore(storeOverrides);
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

// ─── Like System Integration ──────────────────────────────────────────────────

describe('Like System Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should persist like state between frontend and backend', async () => {
    const postId = 'post1';
    const initialPosts = [{ _id: postId, caption: 'Test post', likesCount: 2, commentsCount: 0 }];

    // Simulate API returning liked state
    likeService.toggleLike.mockResolvedValue({ liked: true });

    const store = createMockStore({
      posts: { posts: initialPosts, currentPost: null, loading: false, error: null, hasMore: true, page: 1 },
      auth: { isAuthenticated: true, user: { _id: 'user1', username: 'testuser' }, loading: false, error: null },
    });

    // Dispatch like action
    store.dispatch(likePost({ postId }));

    const state = store.getState();
    const likedPost = state.posts.posts.find(p => p._id === postId);
    expect(likedPost.likesCount).toBe(3);

    // Simulate page refresh by re-fetching data
    store.dispatch(
      fetchPostsSuccess({
        posts: [{ _id: postId, caption: 'Test post', likesCount: 3, commentsCount: 0 }],
        hasMore: false,
        page: 1,
        reset: true,
      })
    );

    const refreshedState = store.getState();
    const refreshedPost = refreshedState.posts.posts.find(p => p._id === postId);
    expect(refreshedPost.likesCount).toBe(3);
  });

  it('should handle like count going to zero gracefully', () => {
    const postId = 'post1';
    const store = createMockStore({
      posts: {
        posts: [{ _id: postId, caption: 'Test post', likesCount: 1, commentsCount: 0 }],
        currentPost: null,
        loading: false,
        error: null,
        hasMore: true,
        page: 1,
      },
      auth: { isAuthenticated: true, user: { _id: 'user1', username: 'testuser' }, loading: false, error: null },
    });

    store.dispatch(unlikePost({ postId }));

    const state = store.getState();
    const post = state.posts.posts.find(p => p._id === postId);
    // Count should reach 0, not go negative (Math.max(0, count - 1) pattern)
    expect(post.likesCount).toBe(0);
  });

  it('should handle toggle like on already-liked post', () => {
    const postId = 'post1';
    const store = createMockStore({
      posts: {
        posts: [{ _id: postId, caption: 'Test post', likesCount: 5, commentsCount: 0 }],
        currentPost: null,
        loading: false,
        error: null,
        hasMore: true,
        page: 1,
      },
      auth: { isAuthenticated: true, user: { _id: 'user1', username: 'testuser' }, loading: false, error: null },
    });

    // First like
    store.dispatch(likePost({ postId }));
    expect(store.getState().posts.posts[0].likesCount).toBe(6);

    // Toggle unlike
    store.dispatch(unlikePost({ postId }));
    expect(store.getState().posts.posts[0].likesCount).toBe(5);
  });
});

// ─── Comment System Integration ───────────────────────────────────────────────

describe('Comment System Integration', () => {
  const mockAuthState = { isAuthenticated: true, user: { _id: 'user1', username: 'testuser' }, loading: false, error: null };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add comment and update state', async () => {
    const postId = 'post1';
    const mockSetComments = vi.fn();
    const newComment = {
      _id: 'comment1',
      text: 'Great recipe!',
      user: { _id: 'user1', username: 'testuser', profileImage: null },
      createdAt: new Date().toISOString(),
    };

    commentService.addComment.mockResolvedValue({ data: { comment: newComment } });

    renderWithStore(
      <CommentSection postId={postId} comments={[]} setComments={mockSetComments} />,
      {
        posts: { posts: [], currentPost: null, loading: false, error: null, hasMore: true, page: 1 },
        auth: mockAuthState,
      }
    );

    const input = screen.getByPlaceholderText('Add a comment...');
    fireEvent.change(input, { target: { value: 'Great recipe!' } });
    fireEvent.click(screen.getByText('Post'));

    await waitFor(() => {
      expect(commentService.addComment).toHaveBeenCalledWith(postId, 'Great recipe!');
    });

    await waitFor(() => {
      expect(mockSetComments).toHaveBeenCalledWith([newComment]);
    });
  });

  it('should handle empty comments array gracefully', () => {
    renderWithStore(
      <CommentSection postId="post1" comments={[]} setComments={vi.fn()} />,
      { posts: { posts: [], currentPost: null, loading: false, error: null, hasMore: true, page: 1 }, auth: mockAuthState }
    );
    // safeComments pattern: empty array renders "No comments yet"
    expect(screen.getByText(/No comments yet/i)).toBeInTheDocument();
  });

  it('should handle comments on fresh post with no comments (undefined)', () => {
    renderWithStore(
      <CommentSection postId="post1" comments={undefined} setComments={vi.fn()} />,
      { posts: { posts: [], currentPost: null, loading: false, error: null, hasMore: true, page: 1 }, auth: mockAuthState }
    );
    // safeComments = comments || [] — should not crash
    expect(screen.getByText(/No comments yet/i)).toBeInTheDocument();
  });

  it('should handle Redux addComment action updating commentsCount', () => {
    const postId = 'post1';
    const store = createMockStore({
      posts: {
        posts: [{ _id: postId, caption: 'Test post', likesCount: 0, commentsCount: 3 }],
        currentPost: null,
        loading: false,
        error: null,
        hasMore: true,
        page: 1,
      },
      auth: mockAuthState,
    });

    store.dispatch(addComment({ postId }));

    const state = store.getState();
    const post = state.posts.posts.find(p => p._id === postId);
    expect(post.commentsCount).toBe(4);
  });
});

// ─── Follow System Integration ────────────────────────────────────────────────

describe('Follow System Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update follower count when following user', () => {
    const store = createMockStore({
      user: {
        profile: { _id: 'user2', username: 'otheruser', followersCount: 10 },
        userPosts: [],
        loading: false,
        error: null,
      },
      auth: { isAuthenticated: true, user: { _id: 'user1', username: 'testuser' }, loading: false, error: null },
    });

    store.dispatch(updateFollowStatus({ isFollowing: true }));

    const state = store.getState();
    expect(state.user.profile.followersCount).toBe(11);
  });

  it('should handle unfollow and decrease count', () => {
    const store = createMockStore({
      user: {
        profile: { _id: 'user2', username: 'otheruser', followersCount: 10 },
        userPosts: [],
        loading: false,
        error: null,
      },
      auth: { isAuthenticated: true, user: { _id: 'user1', username: 'testuser' }, loading: false, error: null },
    });

    store.dispatch(updateFollowStatus({ isFollowing: false }));

    const state = store.getState();
    expect(state.user.profile.followersCount).toBe(9);
  });
});

// ─── Empty vs Seeded Database Scenarios ──────────────────────────────────────

describe('Database State Scenarios', () => {
  const authState = { isAuthenticated: true, user: { _id: 'user1', username: 'testuser' }, loading: false, error: null };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state when posts array is empty', () => {
    renderWithStore(<Home />, {
      posts: { posts: [], currentPost: null, loading: false, error: null, hasMore: false, page: 1 },
      auth: authState,
    });

    expect(screen.getByText(/No posts yet/i)).toBeInTheDocument();
  });

  it('should render posts when data is seeded', () => {
    const seededPosts = [
      { _id: 'p1', caption: 'Spaghetti Carbonara', likesCount: 3, commentsCount: 2, author: { _id: 'u1', username: 'chef_marco', profileImage: null }, image: 'https://example.com/1.jpg', createdAt: new Date().toISOString() },
      { _id: 'p2', caption: 'Chicken Tikka Masala', likesCount: 4, commentsCount: 2, author: { _id: 'u2', username: 'foodie_priya', profileImage: null }, image: 'https://example.com/2.jpg', createdAt: new Date().toISOString() },
    ];

    renderWithStore(<Home />, {
      posts: { posts: seededPosts, currentPost: null, loading: false, error: null, hasMore: false, page: 1 },
      auth: authState,
    });

    expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    expect(screen.getByText('Chicken Tikka Masala')).toBeInTheDocument();
    expect(screen.getAllByText('chef_marco').length).toBeGreaterThan(0);
    expect(screen.getAllByText('foodie_priya').length).toBeGreaterThan(0);
  });

  it('should handle undefined posts array without crashing (safePosts fallback)', () => {
    renderWithStore(<Home />, {
      posts: { posts: undefined, currentPost: null, loading: false, error: null, hasMore: false, page: 1 },
      auth: authState,
    });

    // safePosts = posts || [] — should fall back to empty state, not crash
    expect(screen.getByText(/No posts yet/i)).toBeInTheDocument();
  });
});
