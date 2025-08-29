import { useEffect, useRef } from 'react';
import { isAuthenticated, isTokenExpiringSoon } from '../utils/tokenManager';
import API from '../api/api';

/**
 * TokenRefreshManager component
 * Handles automatic token refresh in the background
 * Monitors token expiration and refreshes before it expires
 */
function TokenRefreshManager() {
  // Reference to store the refresh timer
  const refreshTimerRef = useRef(null);

  // Set up a timer to check token expiration
  const setupRefreshTimer = () => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Only set up timer if user is authenticated
    if (!isAuthenticated()) return;

    // Check every minute if the token is close to expiring
    refreshTimerRef.current = setInterval(async () => {
      if (isTokenExpiringSoon(5)) {  // 5 minutes before expiration
        try {
          // Call the refresh endpoint
          await API.post('/auth/refresh');
          console.log('Token refreshed successfully');
        } catch (error) {
          console.error('Token refresh failed:', error);
          // If refresh fails, clear the interval
          if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
          }
        }
      }
    }, 60000); // Check every minute
  };

  // Set up the refresh timer when the component mounts
  useEffect(() => {
    setupRefreshTimer();

    // Clean up the timer when the component unmounts
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  // Listen for storage events (in case authentication status changes in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'isAuthenticated') {
        setupRefreshTimer();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // This component doesn't render anything
  return null;
}

export default TokenRefreshManager;
