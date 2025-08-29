import { useState, useCallback } from 'react';
import { sanitizeString, sanitizeObject } from './sanitize';

/**
 * Custom hook for form state management with automatic input sanitization
 * @param {Object} initialState - Initial form state
 * @returns {Array} [formState, setFormField, handleChange, resetForm, sanitizeAndSubmit]
 */
function useSanitizedForm(initialState = {}) {
  // Initialize form state
  const [formState, setFormState] = useState(initialState);

  /**
   * Set a single form field with sanitization
   * @param {string} name - Field name
   * @param {string} value - Field value to sanitize
   */
  const setFormField = useCallback((name, value) => {
    const sanitizedValue = typeof value === 'string'
      ? sanitizeString(value)
      : value;

    setFormState(prevState => ({
      ...prevState,
      [name]: sanitizedValue
    }));
  }, []);

  /**
   * Handle input change event with sanitization
   * @param {Event} e - Change event
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    // Handle different input types
    if (type === 'checkbox') {
      setFormField(name, checked);
    } else {
      setFormField(name, value);
    }
  }, [setFormField]);

  /**
   * Reset the form to initial state or new state
   * @param {Object} newState - New state (optional)
   */
  const resetForm = useCallback((newState = initialState) => {
    setFormState(newState);
  }, [initialState]);

  /**
   * Sanitize entire form and prepare for submission
   * @param {Function} submitFn - Submit function to call with sanitized data
   * @returns {Function} Form submit handler
   */
  const sanitizeAndSubmit = useCallback((submitFn) => {
    return (e) => {
      e.preventDefault();
      const sanitizedData = sanitizeObject(formState);
      submitFn(sanitizedData, e);
    };
  }, [formState]);

  return [formState, setFormField, handleChange, resetForm, sanitizeAndSubmit];
}

export default useSanitizedForm;
