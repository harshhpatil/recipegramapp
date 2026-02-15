import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { usePosts } from '../hooks';
import PostCard from '../components/post/PostCard';
import PostCardSkeleton from '../components/common/PostCardSkeleton';
import CreatePostModal from '../components/post/CreatePostModal';

const Home = () => {
  const { posts, loading, error } = useSelector((state) => state.posts);
  const { fetchPosts } = usePosts();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Home Feed</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Post
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {loading && posts.length === 0 ? (
        <div className="space-y-8">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-4">No posts yet. Start following users to see their recipes!</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
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
