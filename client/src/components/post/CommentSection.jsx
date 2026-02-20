import { useState } from 'react';
import { useSelector } from 'react-redux';
import { commentService } from '../../services';

const CommentSection = ({ postId, comments, setComments }) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated, user: currentUser } = useSelector((state) => state.auth);

  // Ensure comments is always an array
  const safeComments = comments || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !isAuthenticated) return;

    if (newComment.length > 500) {
      setError('Comment must be 500 characters or less');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await commentService.addComment(postId, newComment);
      const newCommentData = response.data?.comment || response.comment;
      if (newCommentData) {
        setComments([newCommentData, ...safeComments]);
      }
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentService.deleteComment(commentId);
      setComments(safeComments.filter(c => c._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-semibold mb-4">Comments</h3>

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <p className="text-xs text-gray-500 mt-1">{newComment.length}/500 characters</p>
        </form>
      )}

      <div className="space-y-4">
        {safeComments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          safeComments.map((comment) => {
            const isCommentAuthor = currentUser && comment.user?._id === currentUser._id;
            
            return (
              <div key={comment._id} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm shrink-0">
                  {comment.user?.profileImage ? (
                    <img 
                      src={comment.user.profileImage} 
                      alt={comment.user.username} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    comment.user?.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{comment.user?.username}</span>
                      {isCommentAuthor && (
                        <button
                          onClick={() => handleDelete(comment._id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                          title="Delete comment"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 mt-1">{comment.text}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 px-4">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommentSection;
