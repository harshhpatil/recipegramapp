import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Home from './Home';
import postReducer from '../store/slices/postSlice';

// Mock hooks
vi.mock('../hooks', () => ({
  usePosts: () => ({
    fetchPosts: vi.fn().mockResolvedValue({ success: true }),
  }),
  useFeed: () => ({
    fetchFeed: vi.fn().mockResolvedValue({ success: true, posts: [] }),
  }),
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      posts: postReducer,
      auth: (state = { user: null, isAuthenticated: false }) => state,
    },
    preloadedState: initialState,
  });
};

const renderWithProviders = (component, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Home Component', () => {
  it('should render without crashing', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('Home Feed')).toBeInTheDocument();
  });

  it('should display loading skeletons when loading', () => {
    const initialState = {
      posts: {
        posts: [],
        loading: true,
        error: null,
        hasMore: true,
        page: 1,
      },
    };
    
    renderWithProviders(<Home />, initialState);
    // PostCardSkeleton components should be rendered
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display empty state when no posts', () => {
    const initialState = {
      posts: {
        posts: [],
        loading: false,
        error: null,
        hasMore: false,
        page: 1,
      },
    };
    
    renderWithProviders(<Home />, initialState);
    expect(screen.getByText(/No posts yet/i)).toBeInTheDocument();
  });

  it('should display posts when available', () => {
    const mockPosts = [
      {
        _id: '1',
        caption: 'Test Post 1',
        image: 'test1.jpg',
        author: { _id: 'user1', username: 'testuser1', profileImage: null },
        likesCount: 5,
        commentsCount: 3,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        caption: 'Test Post 2',
        image: 'test2.jpg',
        author: { _id: 'user2', username: 'testuser2', profileImage: null },
        likesCount: 10,
        commentsCount: 7,
        createdAt: new Date().toISOString(),
      },
    ];

    const initialState = {
      posts: {
        posts: mockPosts,
        loading: false,
        error: null,
        hasMore: true,
        page: 1,
      },
    };
    
    renderWithProviders(<Home />, initialState);
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
  });

  it('should display error message when error occurs', () => {
    const initialState = {
      posts: {
        posts: [],
        loading: false,
        error: 'Failed to fetch posts',
        hasMore: false,
        page: 1,
      },
    };
    
    renderWithProviders(<Home />, initialState);
    expect(screen.getByText(/Failed to fetch posts/i)).toBeInTheDocument();
  });

  it('should handle undefined posts array gracefully', () => {
    const initialState = {
      posts: {
        posts: undefined, // This should be handled gracefully
        loading: false,
        error: null,
        hasMore: false,
        page: 1,
      },
    };
    
    renderWithProviders(<Home />, initialState);
    expect(screen.getByText(/No posts yet/i)).toBeInTheDocument();
  });

  it('should render Create Post button', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('Create Post')).toBeInTheDocument();
  });
});
