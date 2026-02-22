import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePosts } from '../../hooks';
import { likeService, saveService } from '../../services';

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const { likePost, unlikePost } = usePosts();

  useEffect(() => {
    // Check if the current user has liked and saved this post
    const checkStatus = async () => {
      try {
        const [likeResponse, saveResponse] = await Promise.all([
          likeService.checkIfLiked(post._id),
          saveService.checkIfSaved(post._id),
        ]);
        setIsLiked(likeResponse?.data?.isLiked || likeResponse?.isLiked || false);
        setIsSaved(saveResponse?.data?.isSaved || saveResponse?.isSaved || false);
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };
    checkStatus();
  }, [post._id]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await likeService.toggleLike(post._id);
      if (isLiked) {
        setLikesCount(prev => prev - 1);
      } else {
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await saveService.toggleSave(post._id);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  return (
    <article className="card group overflow-hidden animate-fade-in">
      {/* Post Header */}
      <div className="p-5 flex items-center justify-between">
        <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="avatar w-11 h-11">
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
          <div>
            <p className="font-semibold text-warmGray-900">{post.author?.username}</p>
            {post.author?.followersCount !== undefined && (
              <p className="text-xs text-warmGray-500">
                {post.author.followersCount} {post.author.followersCount === 1 ? 'follower' : 'followers'}
              </p>
            )}
          </div>
        </Link>
        
        {/* Optional: More options button */}
        <button className="p-2 text-warmGray-500 hover:text-warmGray-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Post Image */}
      <Link to={`/post/${post._id}`} className="block relative overflow-hidden bg-warmGray-100">
        <img 
          src={post.image} 
          alt={post.caption} 
          className="w-full h-72 sm:h-80 md:h-96 object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-warmGray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Post Actions */}
      <div className="p-5 space-y-3">
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button 
              onClick={handleLike}
              className={`p-2 rounded-lg transition-all duration-200 active:scale-90 ${
                isLiked 
                  ? 'text-error-500 hover:text-error-600' 
                  : 'text-warmGray-600 hover:text-error-500 hover:bg-error-50'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <svg className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <Link 
              to={`/post/${post._id}`} 
              className="p-2 text-warmGray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 active:scale-90" 
              title="Comment"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
          </div>
          <button 
            onClick={handleSave}
            className={`p-2 rounded-lg transition-all duration-200 active:scale-90 ${
              isSaved 
                ? 'text-secondary-600 hover:text-secondary-700' 
                : 'text-warmGray-600 hover:text-secondary-600 hover:bg-secondary-50'
            }`}
            title={isSaved ? 'Unsave' : 'Save'}
          >
            <svg className="w-6 h-6" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Likes Count */}
        {likesCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <svg className="w-4 h-4 text-error-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="font-medium text-warmGray-900">
              {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
            </span>
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="text-sm leading-relaxed">
            <Link to={`/profile/${post.author?.username}`} className="font-semibold text-warmGray-900 hover:text-primary-600 transition-colors">
              {post.author?.username}
            </Link>
            {' '}
            <span className="text-warmGray-700">{post.caption}</span>
          </div>
        )}

        {/* Comments Link */}
        {post.commentsCount > 0 && (
          <Link 
            to={`/post/${post._id}`} 
            className="inline-flex items-center gap-1.5 text-sm text-warmGray-500 hover:text-warmGray-700 transition-colors group/comment"
          >
            <svg className="w-4 h-4 transition-transform group-hover/comment:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            View all {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
          </Link>
        )}

        {/* Timestamp (optional - would need to be passed in post data) */}
        {post.createdAt && (
          <p className="text-xs text-warmGray-400 uppercase tracking-wide">
            {new Date(post.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric'
            })}
          </p>
        )}
      </div>
    </article>
  );
};

export default PostCard;
