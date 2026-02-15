import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../hooks';

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            RecipeGram
          </Link>

          <nav className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link to="/" className="hover:text-blue-600">
                  Home
                </Link>
                <Link to="/explore" className="hover:text-blue-600">
                  Explore
                </Link>
                <Link to="/search" className="hover:text-blue-600">
                  Search
                </Link>
                <Link to="/messages" className="hover:text-blue-600">
                  Messages
                </Link>
                <Link to={`/profile/${user?.username}`} className="hover:text-blue-600">
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-600">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
