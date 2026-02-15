import { useEffect, useState } from 'react';
import { postService } from '../services';
import PostCard from '../components/post/PostCard';
import PostCardSkeleton from '../components/common/PostCardSkeleton';

const Explore = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const fetchTrendingPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await postService.getTrendingPosts(20);
      const data = response.data || response;
      setTrendingPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      setError(error.message || 'Failed to fetch trending posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setError('');
      const response = await postService.searchPosts(searchQuery, 1, 20);
      const data = response.data || response;
      setSearchResults(data.posts || []);
    } catch (error) {
      console.error('Error searching posts:', error);
      setError(error.message || 'Failed to search posts');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError('');
  };

  const displayPosts = searchResults.length > 0 ? searchResults : trendingPosts;
  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Explore Recipes</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes by name or ingredients..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearchActive ? (
            <button
              type="button"
              onClick={clearSearch}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Clear
            </button>
          ) : (
            <button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          )}
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Section Title */}
      <h2 className="text-2xl font-semibold mb-6">
        {isSearchActive ? `Search Results for "${searchQuery}"` : 'Trending Recipes'}
      </h2>

      {/* Posts Grid */}
      {loading || searching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : displayPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-2">
            {isSearchActive ? 'No recipes found' : 'No trending recipes yet'}
          </p>
          <p className="text-gray-400">
            {isSearchActive ? 'Try different keywords' : 'Check back later for trending content'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
