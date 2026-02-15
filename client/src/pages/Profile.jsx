import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserStart, fetchUserSuccess, fetchUserFailure } from '../store/slices/userSlice';
import { userService } from '../services';
import PostCard from '../components/post/PostCard';

const Profile = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { profile, userPosts, loading } = useSelector((state) => state.user);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        dispatch(fetchUserStart());
        const response = await userService.getUserProfile(username);
        dispatch(fetchUserSuccess(response.data));
        
        // Fetch user's posts
        const postsResponse = await userService.getUserPosts(response.data._id);
        setPosts(postsResponse.data || []);
      } catch (error) {
        dispatch(fetchUserFailure(error.message));
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username, dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">User not found</div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === profile.username;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-start gap-8">
          <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-4xl font-bold text-gray-600">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt={profile.username} className="w-full h-full rounded-full object-cover" />
            ) : (
              profile.username.charAt(0).toUpperCase()
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold">{profile.username}</h1>
              {isOwnProfile && (
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Edit Profile
                </button>
              )}
            </div>
            
            <div className="flex gap-8 mb-4">
              <div>
                <span className="font-bold">{posts.length}</span> posts
              </div>
              <div>
                <span className="font-bold">{profile.followersCount}</span> followers
              </div>
              <div>
                <span className="font-bold">{profile.followingCount}</span> following
              </div>
            </div>
            
            {profile.bio && (
              <p className="text-gray-700">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No posts yet</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
