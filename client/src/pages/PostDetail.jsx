import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { postService, commentService, likeService } from '../services';
import { usePosts } from '../hooks';
import CommentSection from '../components/post/CommentSection';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState('');
  const [editIngredients, setEditIngredients] = useState('');
  const [editSteps, setEditSteps] = useState('');
  const [error, setError] = useState(null);
  const { deletePost: deletePostHook } = usePosts();

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const [postResponse, commentsResponse, likeResponse] = await Promise.all([
          postService.getPostById(postId),
          commentService.getComments(postId),
          likeService.checkIfLiked(postId),
        ]);
        const postData = postResponse.data || postResponse;
        setPost(postData);
        setComments(commentsResponse.data?.comments || commentsResponse.comments || []);
        setIsLiked(likeResponse.data?.isLiked || likeResponse.isLiked || false);
        setLikesCount(postData.likesCount || 0);
        setEditCaption(postData.caption || '');
        setEditIngredients(postData.ingredients?.join('\n') || '');
        setEditSteps(postData.steps?.join('\n') || '');
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(error.response?.data?.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

  const handleLike = async () => {
    try {
      await likeService.toggleLike(postId);
      if (isLiked) {
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      setError(error.response?.data?.message || 'Failed to toggle like');
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const result = await deletePostHook(postId);
        if (result.success) {
          navigate('/');
        } else {
          alert('Failed to delete post');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const ingredients = editIngredients.split('\n').filter(i => i.trim());
      const steps = editSteps.split('\n').filter(s => s.trim());
      
      const response = await postService.updatePost(postId, {
        caption: editCaption,
        ingredients,
        steps,
      });
      
      const updatedPost = response.data?.post || response.post;
      setPost(updatedPost);
      setIsEditing(false);
      alert('Post updated successfully!');
    } catch (error) {
      console.error('Error updating post:', error);
      alert(error.message || 'Failed to update post');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading post...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Post not found</div>
      </div>
    );
  }

  const isAuthor = currentUser && post.author?._id === currentUser._id;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <img 
          src={post.image} 
          alt={post.caption} 
          className="w-full h-96 object-cover"
        />
        
        <div className="p-6">
          {/* Author Info and Actions */}
          <div className="flex items-center justify-between mb-4">
            <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">
                {post.author?.profileImage ? (
                  <img src={post.author.profileImage} alt={post.author.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  post.author?.username?.charAt(0).toUpperCase()
                )}
              </div>
              <span className="font-semibold hover:underline">{post.author?.username}</span>
            </Link>

            {isAuthor && !isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Edit Post
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete Post
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Caption</label>
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  maxLength={2000}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ingredients (one per line)</label>
                <textarea
                  value={editIngredients}
                  onChange={(e) => setEditIngredients(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={5}
                  placeholder="Flour&#10;Sugar&#10;Eggs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Steps (one per line)</label>
                <textarea
                  value={editSteps}
                  onChange={(e) => setEditSteps(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={5}
                  placeholder="Mix ingredients&#10;Bake for 30 minutes"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">{post.caption}</h2>

              {/* Like and Comment Actions */}
              <div className="flex gap-4 mb-4 pb-4 border-b border-gray-200">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2 hover:text-red-600 ${isLiked ? 'text-red-600' : 'text-gray-700'}`}
                >
                  <svg className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="font-semibold">{likesCount} likes</span>
                </button>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-semibold">{post.commentsCount} comments</span>
                </div>
              </div>

              {/* Ingredients */}
              {post.ingredients && post.ingredients.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
                  <ul className="list-disc list-inside space-y-2 bg-gray-50 p-4 rounded-md">
                    {post.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-gray-700">{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cooking Steps */}
              {post.steps && post.steps.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Cooking Steps</h3>
                  <ol className="space-y-3">
                    {post.steps.map((step, index) => (
                      <li key={index} className="flex gap-3 bg-gray-50 p-4 rounded-md">
                        <span className="font-bold text-blue-500 text-lg">{index + 1}.</span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}

          {/* Comments Section */}
          <CommentSection postId={postId} comments={comments} setComments={setComments} />
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
