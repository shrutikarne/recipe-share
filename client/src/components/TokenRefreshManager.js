import { useEffect, useRef, useCallback } from 'react';
import { isAuthenticated, getTokenExpiry } from '../utils/tokenManager';
import API from '../api/api';

/**
 * TokenRefreshManager component
 * Handles automatic token refresh in the background
 * Monitors token expiration and refreshes before it expires
 */
function TokenRefreshManager() {
  // Reference to store the refresh timer
  const refreshTimerRef = useRef(null);

  // Schedule a single refresh shortly before token expiry
  const setupRefreshTimer = useCallback(() => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    if (!isAuthenticated()) return;

    const expiry = getTokenExpiry();
    if (!expiry) return;

    const bufferMs = 5 * 60 * 1000; // 5 minutes
    const delay = Math.max(0, expiry - Date.now() - bufferMs);

    refreshTimerRef.current = setTimeout(async () => {
      try {
        await API.post('/auth/refresh');
      } catch (error) {
        // no-op; interceptor handles logout on 401
      } finally {
        // Reschedule next check based on new expiry
        setupRefreshTimer();
      }
    }, delay);
  }, []);

  // Set up the refresh timer when the component mounts
  useEffect(() => {
    setupRefreshTimer();

    // Clean up the timer when the component unmounts
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [setupRefreshTimer]);

  // Listen for storage events (in case authentication status changes in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'isAuthenticated' || e.key === 'tokenExpiry') {
        setupRefreshTimer();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setupRefreshTimer]);

  // This component doesn't render anything
  return null;
}

export default TokenRefreshManager;
