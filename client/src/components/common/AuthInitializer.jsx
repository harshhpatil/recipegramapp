import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../hooks';
import { useSocket, useSocketDisconnect } from '../../hooks/useSocket';

/**
 * AuthInitializer - Rehydrates user data from token on app mount
 * Solves the race condition where isAuthenticated=true but user=null
 * Also initializes WebSocket connection for real-time messaging
 * 
 * Error handling:
 * - Gracefully catches socket initialization errors
 * - Prevents component tree crash on failed socket connection
 * - App remains functional even if WebSocket fails
 */
const AuthInitializer = ({ children }) => {
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const { getCurrentUser } = useAuth();
  const getDisconnectSocket = useSocketDisconnect();

  // Initialize socket for messaging (with error handling)
  useSocket(token);

  useEffect(() => {
    // If we have a token (authenticated) but no user data, fetch it
    if (isAuthenticated && !user) {
      getCurrentUser().catch((error) => {
        console.error('Failed to fetch current user:', error);
      });
    }
  }, [isAuthenticated, user, getCurrentUser]);

  useEffect(() => {
    // Disconnect socket on logout
    return () => {
      if (!isAuthenticated) {
        try {
          getDisconnectSocket();
        } catch (error) {
          console.warn('Error disconnecting socket:', error);
        }
      }
    };
  }, [isAuthenticated, getDisconnectSocket]);

  return children;
};

export default AuthInitializer;

