import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserStart, fetchUserSuccess, fetchUserFailure } from '../store/slices/userSlice';
import { userService, followService } from '../services';
import { useFollow } from '../hooks';
import PostCard from '../components/post/PostCard';
import EditProfileModal from '../components/user/EditProfileModal';

const Profile = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { profile, userPosts, loading } = useSelector((state) => state.user);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toggleFollow } = useFollow();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        dispatch(fetchUserStart());
        
        // Handle /profile/me alias - use current user's username
        const targetUsername = username === 'me' ? currentUser?.username : username;
        
        // If "me" but currentUser not loaded yet, wait
        if (username === 'me' && !currentUser) {
          return;
        }
        
        const response = await userService.getUserProfile(targetUsername);
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
  }, [username, currentUser, dispatch]);

  const isOwnProfile = currentUser?.username === profile?.username;

  useEffect(() => {
    if (!isOwnProfile && profile?._id) {
      const checkFollowStatus = async () => {
        try {
          const response = await followService.checkIfFollowing(profile._id);
          setIsFollowing(response.data?.isFollowing || false);
        } catch (error) {
          console.error('Error checking follow status:', error);
        }
      };
      checkFollowStatus();
    }
  }, [profile?._id, isOwnProfile]);

  const handleFollow = async () => {
    const result = await toggleFollow(profile._id, isFollowing);
    if (result.success) {
      setIsFollowing(result.isFollowing);
    }
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <div className="text-xl text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div className="text-xl font-semibold text-gray-700 mb-2">User not found</div>
          <p className="text-gray-500 mb-4">This profile doesn't exist or has been removed</p>
          <a href="/search" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Search for Users
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-start gap-8 flex-col sm:flex-row">
          <div className="w-32 h-32 bg-linear-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt={profile.username} className="w-full h-full rounded-full object-cover" />
            ) : (
              profile.username.charAt(0).toUpperCase()
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-800">{profile.username}</h1>
              {isOwnProfile ? (
                <button
                  onClick={handleEditProfile}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Following
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Follow
                    </>
                  )}
                </button>
              )}
            </div>
            
            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <div className="font-bold text-xl text-gray-800">{posts.length}</div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl text-gray-800">{profile.followersCount || 0}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl text-gray-800">{profile.followingCount || 0}</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
            </div>
            
            {profile.bio && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-gray-700">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Posts</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium mb-2">{isOwnProfile ? 'You haven\'t posted yet' : 'No posts yet'}</p>
            <p className="text-gray-400">{isOwnProfile ? 'Share your first recipe with the community!' : 'Check back later for new content'}</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentProfile={profile}
        />
      )}
    </div>
  );
};

export default Profile;
