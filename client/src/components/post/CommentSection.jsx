import { useState } from 'react';
import { useSelector } from 'react-redux';
import { commentService } from '../../services';

const CommentSection = ({ postId, comments, setComments }) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !isAuthenticated) return;

    setLoading(true);
    try {
      const response = await commentService.addComment(postId, newComment);
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
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
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm flex-shrink-0">
                {comment.author?.profileImage ? (
                  <img 
                    src={comment.author.profileImage} 
                    alt={comment.author.username} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  comment.author?.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <span className="font-semibold text-sm">{comment.author?.username}</span>
                  <p className="text-gray-700 mt-1">{comment.content}</p>
                </div>
                <div className="text-xs text-gray-500 mt-1 px-4">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
