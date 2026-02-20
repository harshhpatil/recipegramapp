import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce, useFollow } from '../hooks';
import { userService, followService } from '../services';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followStates, setFollowStates] = useState({});
  
  const debouncedQuery = useDebounce(query, 500);
  const { toggleFollow } = useFollow();

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await userService.searchUsers(searchQuery);
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch(debouncedQuery);
  }, [debouncedQuery]);

  useEffect(() => {
    const checkFollowStatuses = async () => {
      try {
        const entries = await Promise.all(
          results.map(async (user) => {
            try {
              const response = await followService.checkIfFollowing(user._id);
              return [user._id, response.data?.isFollowing || false];
            } catch (error) {
              console.error('Error checking follow status:', error);
              return [user._id, false];
            }
          })
        );
        setFollowStates(Object.fromEntries(entries));
      } catch (error) {
        console.error('Error checking follow statuses:', error);
      }
    };

    if (results.length > 0) {
      checkFollowStatuses();
    }
  }, [results]);

  const handleFollowClick = async (userId) => {
    const isCurrentlyFollowing = followStates[userId] || false;
    const result = await toggleFollow(userId, isCurrentlyFollowing);

    if (result.success) {
      setFollowStates(prev => ({
        ...prev,
        [userId]: result.isFollowing
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Search Users</h1>
      
      <div className="mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for users..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="text-lg">Searching...</div>
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-8">
          <p className="text-gray-500">No users found</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          {results.map((user) => {
            const isFollowing = followStates[user._id] || false;

            return (
              <div key={user._id} className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4">
                <Link to={`/profile/${user.username}`}>
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                </Link>
                <div className="flex-1">
                  <Link to={`/profile/${user.username}`}>
                    <h3 className="font-semibold hover:underline">{user.username}</h3>
                  </Link>
                  {user.bio && <p className="text-sm text-gray-600">{user.bio}</p>}
                </div>
                <button
                  onClick={() => handleFollowClick(user._id)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Search;
