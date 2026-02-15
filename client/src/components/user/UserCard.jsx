import { Link } from 'react-router-dom';

const UserCard = ({ user, showFollowButton = false, onFollow }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
      <Link to={`/profile/${user.username}`}>
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">
          {user.profileImage ? (
            <img 
              src={user.profileImage} 
              alt={user.username} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            user.username.charAt(0).toUpperCase()
          )}
        </div>
      </Link>

      <div className="flex-1">
        <Link to={`/profile/${user.username}`} className="font-semibold hover:underline">
          {user.username}
        </Link>
        {user.bio && (
          <p className="text-sm text-gray-600 truncate">{user.bio}</p>
        )}
      </div>

      {showFollowButton && (
        <button
          onClick={() => onFollow && onFollow(user._id)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Follow
        </button>
      )}
    </div>
  );
};

export default UserCard;
