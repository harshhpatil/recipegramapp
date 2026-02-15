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
  const { deletePost: deletePostHook } = usePosts();

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const [postResponse, commentsResponse, likeResponse] = await Promise.all([
          postService.getPostById(postId),
          commentService.getComments(postId),
          likeService.checkIfLiked(postId),
        ]);
        setPost(postResponse.data);
        setComments(commentsResponse.data);
        setIsLiked(likeResponse.data.isLiked);
        setLikesCount(postResponse.data.likesCount || 0);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await likeService.unlikePost(postId);
        setLikesCount(prev => prev - 1);
      } else {
        await likeService.likePost(postId);
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading post...</div>
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

            {isAuthor && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete Post
              </button>
            )}
          </div>

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

          {/* Comments Section */}
          <CommentSection postId={postId} comments={comments} setComments={setComments} />
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
