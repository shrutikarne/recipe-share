import { useState, useCallback } from 'react';
import { handleApiError } from '../utils/ErrorHandler';

/**
 * Custom hook for API calls with standardized error handling
 * @returns {Object} Error handling utilities
 */
const useErrorHandling = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Execute an async function with standardized error handling
   * @param {Function} asyncFn - Async function to execute
   * @param {Object} options - Options for error handling
   * @param {string} options.errorMessage - Custom error message
   * @param {boolean} options.showToast - Whether to show toast notification
   * @param {Function} options.onSuccess - Callback after successful execution
   * @param {Function} options.onError - Callback after error
   * @param {Function} options.onFinally - Callback after completion (success or error)
   * @param {boolean} options.resetErrorOnStart - Whether to reset error state when starting
   * @returns {Promise} Result of the async function
   */
  const executeWithErrorHandling = useCallback(async (
    asyncFn,
    {
      errorMessage = null,
      showToast = true,
      onSuccess = null,
      onError = null,
      onFinally = null,
      resetErrorOnStart = true
    } = {}
  ) => {
    try {
      if (resetErrorOnStart) setError(null);
      setLoading(true);

      const result = await asyncFn();

      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      if (showToast) {
        handleApiError(err, errorMessage);
      }

      setError(err);

      if (onError) onError(err);
      throw err;
    } finally {
      setLoading(false);
      if (onFinally) onFinally();
    }
  }, []);

  /**
   * Clear the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    loading,
    setError,
    setLoading,
    executeWithErrorHandling,
    clearError,
  };
};

export default useErrorHandling;
