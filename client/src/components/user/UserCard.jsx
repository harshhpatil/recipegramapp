import { Link } from 'react-router-dom';

const UserCard = ({ user, showFollowButton = false, onFollow }) => {
  return (
    <div className="card flex items-center gap-4 p-4">
      <Link to={`/profile/${user.username}`}>
        <div className="w-12 h-12 bg-warmGray-200 rounded-full flex items-center justify-center font-bold text-warmGray-600">
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
        <Link to={`/profile/${user.username}`} className="font-semibold text-warmGray-900 hover:underline">
          {user.username}
        </Link>
        {user.bio && (
          <p className="text-sm text-warmGray-600 truncate">{user.bio}</p>
        )}
      </div>

      {showFollowButton && (
        <button
          onClick={() => onFollow && onFollow(user._id)}
          className="btn-primary text-sm"
        >
          Follow
        </button>
      )}
    </div>
  );
};

export default UserCard;
