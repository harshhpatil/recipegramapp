import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { usePosts } from '../hooks';
import PostCard from '../components/post/PostCard';

const Home = () => {
  const { posts, loading, error } = useSelector((state) => state.posts);
  const { fetchPosts } = usePosts();

  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Home Feed</h1>
      
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts yet. Start following users to see their recipes!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
