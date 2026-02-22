import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import * as hooks from '../hooks';
import PostCard from '../components/post/PostCard';
import PostCardSkeleton from '../components/common/PostCardSkeleton';
import CreatePostModal from '../components/post/CreatePostModal';

const Home = () => {
  const feedState = useSelector((state) => state.feed);
  const postsState = useSelector((state) => state.posts);
  const hasFeedSlice = Boolean(feedState);
  const feedPosts = hasFeedSlice ? feedState.feedPosts : postsState?.posts;
  const loading = hasFeedSlice ? feedState.loading : postsState?.loading;
  const error = hasFeedSlice ? feedState.error : postsState?.error;

  const feedHook = typeof hooks.useFeed === 'function' ? hooks.useFeed() : null;
  const fetchFeed = feedHook?.fetchFeed;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const safePosts = Array.isArray(feedPosts) ? feedPosts : [];

  useEffect(() => {
    if (hasFeedSlice && typeof fetchFeed === 'function') {
      fetchFeed(1, true);
    }
  }, [fetchFeed, hasFeedSlice]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-warmGray-900 tracking-tight">Home Feed</h1>
          <p className="text-sm text-warmGray-500 mt-2">Delicious recipes from people you follow</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Post
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
          <h2 className="text-3xl font-semibold text-warmGray-900 mb-3">Your feed is empty</h2>
          <p className="text-warmGray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
            No posts yet. Start following users to see recipes here, or share your own.
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
