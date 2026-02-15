import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePosts } from '../../hooks';
import { likeService } from '../../services';

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const { likePost, unlikePost } = usePosts();

  useEffect(() => {
    // Check if the current user has liked this post
    const checkLikeStatus = async () => {
      try {
        const response = await likeService.checkIfLiked(post._id);
        setIsLiked(response.data.isLiked);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };
    checkLikeStatus();
  }, [post._id]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikePost(post._id);
        setLikesCount(prev => prev - 1);
      } else {
        await likePost(post._id);
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center gap-3">
        <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">
            {post.author?.profileImage ? (
              <img 
                src={post.author.profileImage} 
                alt={post.author.username} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              post.author?.username?.charAt(0).toUpperCase()
            )}
          </div>
          <span className="font-semibold hover:underline">{post.author?.username}</span>
        </Link>
      </div>

      {/* Post Image */}
      <Link to={`/post/${post._id}`}>
        <img 
          src={post.image} 
          alt={post.caption} 
          className="w-full h-96 object-cover cursor-pointer hover:opacity-95"
        />
      </Link>

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex gap-4 mb-3">
          <button 
            onClick={handleLike}
            className={`hover:text-red-600 ${isLiked ? 'text-red-600' : 'text-gray-700'}`}
          >
            <svg className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <Link to={`/post/${post._id}`} className="hover:text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </Link>
        </div>

        <div className="font-semibold mb-2">
          {likesCount} likes
        </div>

        <div className="mb-2">
          <Link to={`/profile/${post.author?.username}`} className="font-semibold hover:underline">
            {post.author?.username}
          </Link>
          {' '}
          <span className="text-gray-700">{post.caption}</span>
        </div>

        {post.commentsCount > 0 && (
          <Link to={`/post/${post._id}`} className="text-gray-500 text-sm hover:underline">
            View all {post.commentsCount} comments
          </Link>
        )}
      </div>
    </div>
  );
};

export default PostCard;
