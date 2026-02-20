import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useFeed } from '../hooks';
import PostCard from '../components/post/PostCard';
import PostCardSkeleton from '../components/common/PostCardSkeleton';
import CreatePostModal from '../components/post/CreatePostModal';

const Home = () => {
  // Use the feed slice for personalized feed (posts from followed users)
  const { feedPosts, loading, error } = useSelector((state) => state.feed);

  const { fetchFeed } = useFeed();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // feedPosts is always an array from initialState
  const safePosts = Array.isArray(feedPosts) ? feedPosts : [];

  useEffect(() => {
    // Fetch personalized feed on mount
    fetchFeed(1, true);
  }, [fetchFeed]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-warmGray-900 tracking-tight">Your Feed</h1>
          <p className="text-sm text-warmGray-500 mt-2">Delicious recipes from people you follow</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </button>
      </div>

      {error && (
        <div className="card bg-error-50 border-error-200 text-error-700 px-6 py-4 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p><strong>Error:</strong> {error}</p>
          </div>
        </div>
      )}
      
      {/* 4. Use safePosts everywhere to ensure .length never hits an undefined object */}
      {loading && safePosts.length === 0 ? (
        <div className="space-y-8">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : safePosts.length === 0 ? (
        <div className="card text-center py-16 px-6">
          <div className="mb-6">
            <svg className="w-28 h-28 mx-auto text-warmGray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-semibold text-warmGray-900 mb-3">Your Feed is Empty</h2>
          <p className="text-warmGray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Start following other users to see their delicious recipes here, or share your own!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              Create Your First Post
            </button>
            <Link
              to="/explore"
              className="btn-outline text-center"
            >
              Explore Recipes
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {safePosts.map((post) => (
            <PostCard key={post?._id || Math.random()} post={post} />
          ))}
          {loading && <PostCardSkeleton />}
        </div>
      )}

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Home;