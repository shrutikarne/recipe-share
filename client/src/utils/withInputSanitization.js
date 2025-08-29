import React from 'react';
import { sanitizeString } from './sanitize';

/**
 * Higher-order component that adds automatic input sanitization to a component
 * with form inputs.
 * 
 * @param {React.ComponentType} WrappedComponent - Component to wrap
 * @returns {React.ComponentType} Enhanced component with sanitized inputs
 */
const withInputSanitization = (WrappedComponent) => {
  // Return a new component
  return function WithInputSanitization(props) {
    // Create a ref to access the DOM
    const formRef = React.useRef(null);

    // Set up event capturing for all inputs
    React.useEffect(() => {
      if (!formRef.current) return;

      // Function to sanitize input values
      const handleInputBeforeChange = (e) => {
        // Skip if this is a React synthetic event (already handled by our sanitization utilities)
        if (e._reactName) return;

        // Only sanitize these input types
        if (['text', 'textarea', 'email', 'password', 'search', 'tel', 'url'].includes(e.target.type)) {
          // Store the sanitized value
          const sanitizedValue = sanitizeString(e.target.value);

          // Only update if different to avoid infinite loops
          if (e.target.value !== sanitizedValue) {
            e.target.value = sanitizedValue;
          }
        }
      };

      // Get all inputs in this component
      const form = formRef.current;

      // Add capture phase listeners to all inputs
      const inputs = form.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.addEventListener('input', handleInputBeforeChange, true);
      });

      // Clean up
      return () => {
        inputs.forEach(input => {
          input.removeEventListener('input', handleInputBeforeChange, true);
        });
      };
    }, []);

    // Render the wrapped component with a ref
    return (
      <div ref={formRef}>
        <WrappedComponent {...props} />
      </div>
    );
  };
};

export default withInputSanitization;
