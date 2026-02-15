import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CommentSection from './CommentSection';
import { commentService } from '../../services';

// Mock comment service
vi.mock('../../services', () => ({
  commentService: {
    addComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}));

const createMockStore = (authState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { isAuthenticated: false, user: null, ...authState }) => state,
    },
  });
};

const renderWithProviders = (component, authState = {}) => {
  const store = createMockStore(authState);
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('CommentSection Component', () => {
  const mockPostId = 'post123';
  const mockSetComments = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    renderWithProviders(
      <CommentSection postId={mockPostId} comments={[]} setComments={mockSetComments} />
    );
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('should display empty state when no comments', () => {
    renderWithProviders(
      <CommentSection postId={mockPostId} comments={[]} setComments={mockSetComments} />
    );
    expect(screen.getByText(/No comments yet/i)).toBeInTheDocument();
  });

  it('should not show comment form when not authenticated', () => {
    renderWithProviders(
      <CommentSection postId={mockPostId} comments={[]} setComments={mockSetComments} />,
      { isAuthenticated: false, user: null }
    );
    expect(screen.queryByPlaceholderText('Add a comment...')).not.toBeInTheDocument();
  });

  it('should show comment form when authenticated', () => {
    renderWithProviders(
      <CommentSection postId={mockPostId} comments={[]} setComments={mockSetComments} />,
      { isAuthenticated: true, user: { _id: 'user1', username: 'testuser' } }
    );
    expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
  });

  it('should display existing comments', () => {
    const mockComments = [
      {
        _id: 'comment1',
        text: 'Great recipe!',
        user: { _id: 'user1', username: 'testuser1', profileImage: null },
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'comment2',
        text: 'Looks delicious!',
        user: { _id: 'user2', username: 'testuser2', profileImage: null },
        createdAt: new Date().toISOString(),
      },
    ];

    renderWithProviders(
      <CommentSection postId={mockPostId} comments={mockComments} setComments={mockSetComments} />
    );

    expect(screen.getByText('Great recipe!')).toBeInTheDocument();
    expect(screen.getByText('Looks delicious!')).toBeInTheDocument();
    expect(screen.getByText('testuser1')).toBeInTheDocument();
    expect(screen.getByText('testuser2')).toBeInTheDocument();
  });

  it('should handle comment submission', async () => {
    const newComment = {
      _id: 'comment3',
      text: 'New comment',
      user: { _id: 'user1', username: 'testuser', profileImage: null },
      createdAt: new Date().toISOString(),
    };

    commentService.addComment.mockResolvedValue({
      data: { comment: newComment },
    });

    renderWithProviders(
      <CommentSection postId={mockPostId} comments={[]} setComments={mockSetComments} />,
      { isAuthenticated: true, user: { _id: 'user1', username: 'testuser' } }
    );

    const input = screen.getByPlaceholderText('Add a comment...');
    const submitButton = screen.getByText('Post');

    fireEvent.change(input, { target: { value: 'New comment' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(commentService.addComment).toHaveBeenCalledWith(mockPostId, 'New comment');
    });

    await waitFor(() => {
      expect(mockSetComments).toHaveBeenCalledWith([newComment]);
    });
  });

  it('should show error when comment is too long', () => {
    renderWithProviders(
      <CommentSection postId={mockPostId} comments={[]} setComments={mockSetComments} />,
      { isAuthenticated: true, user: { _id: 'user1', username: 'testuser' } }
    );

    const input = screen.getByPlaceholderText('Add a comment...');
    const longComment = 'a'.repeat(501);
    
    fireEvent.change(input, { target: { value: longComment } });
    
    const submitButton = screen.getByText('Post');
    fireEvent.click(submitButton);

    expect(screen.getByText(/Comment must be 500 characters or less/i)).toBeInTheDocument();
  });

  it('should handle undefined comments array gracefully', () => {
    renderWithProviders(
      <CommentSection postId={mockPostId} comments={undefined} setComments={mockSetComments} />
    );
    expect(screen.getByText(/No comments yet/i)).toBeInTheDocument();
  });

  it('should handle null comments array gracefully', () => {
    renderWithProviders(
      <CommentSection postId={mockPostId} comments={null} setComments={mockSetComments} />
    );
    expect(screen.getByText(/No comments yet/i)).toBeInTheDocument();
  });

  it('should show delete button for comment author', () => {
    const currentUser = { _id: 'user1', username: 'testuser' };
    const mockComments = [
      {
        _id: 'comment1',
        text: 'My comment',
        user: { _id: 'user1', username: 'testuser', profileImage: null },
        createdAt: new Date().toISOString(),
      },
    ];

    renderWithProviders(
      <CommentSection postId={mockPostId} comments={mockComments} setComments={mockSetComments} />,
      { isAuthenticated: true, user: currentUser }
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should not show delete button for other users comments', () => {
    const currentUser = { _id: 'user1', username: 'testuser' };
    const mockComments = [
      {
        _id: 'comment1',
        text: 'Someone elses comment',
        user: { _id: 'user2', username: 'otheruser', profileImage: null },
        createdAt: new Date().toISOString(),
      },
    ];

    renderWithProviders(
      <CommentSection postId={mockPostId} comments={mockComments} setComments={mockSetComments} />,
      { isAuthenticated: true, user: currentUser }
    );

    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });
});
