import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../hooks';

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { logout } = useAuth();
  const location = useLocation();

  const isActivePath = (path) => location.pathname === path;

  return (
    <header className="glass sticky top-0 z-50 border-b border-cream-300/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link 
            to="/" 
            className="group flex items-center gap-2 transition-transform duration-200 hover:scale-105"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 shadow-soft-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-xl sm:text-2xl font-semibold text-warmGray-900 tracking-tight">
              RecipeGram
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActivePath('/') 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-warmGray-700 hover:bg-warmGray-50 hover:text-warmGray-900'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/explore" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActivePath('/explore') 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-warmGray-700 hover:bg-warmGray-50 hover:text-warmGray-900'
                  }`}
                >
                  Explore
                </Link>
                <Link 
                  to="/search" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActivePath('/search') 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-warmGray-700 hover:bg-warmGray-50 hover:text-warmGray-900'
                  }`}
                >
                  Search
                </Link>
                <Link 
                  to="/messages" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActivePath('/messages') 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-warmGray-700 hover:bg-warmGray-50 hover:text-warmGray-900'
                  }`}
                >
                  Messages
                </Link>
                <Link 
                  to="/saved" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActivePath('/saved') 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-warmGray-700 hover:bg-warmGray-50 hover:text-warmGray-900'
                  }`}
                >
                  Saved
                </Link>
                <div className="w-px h-6 bg-cream-300 mx-2" />
                <Link 
                  to="/profile/me" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-warmGray-700 hover:bg-warmGray-50 transition-all duration-200"
                >
                  <div className="avatar w-8 h-8 text-xs">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.username} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user?.username?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden lg:inline">Profile</span>
                </Link>
                <button
                  onClick={logout}
                  className="ml-2 px-4 py-2 bg-warmGray-100 text-warmGray-700 rounded-lg font-medium hover:bg-warmGray-200 transition-all duration-200 active:scale-95"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-warmGray-700 hover:text-warmGray-900 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
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
