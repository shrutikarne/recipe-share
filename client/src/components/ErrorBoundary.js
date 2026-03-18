import React, { Component } from 'react';
import './ErrorBoundary.scss';
import { TEXT } from '../localization/text';

/**
 * @typedef {Object} ErrorBoundaryState
 * @property {boolean} hasError Indicates whether a descendant threw during rendering.
 * @property {Error|null} error Captured error instance used for diagnostics.
 * @property {React.ErrorInfo|null} errorInfo React component stack for the captured error.
 */

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Sync React error state to trigger fallback rendering.
   * @param {Error} error - Error thrown by a child component.
   * @returns {Partial<ErrorBoundaryState>}
   */
  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  /**
   * Lifecycle hook for logging or side effects after an error is captured.
   * @param {Error} error - The thrown error.
   * @param {React.ErrorInfo} errorInfo - Component stack metadata from React.
   * @returns {void}
   */
  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    this.setState({ errorInfo });

    // Optional: send error to your error tracking service
    // reportError(error, errorInfo);
  }

  /**
   * Render wrapped children or a fallback UI when an error is present.
   * @returns {React.ReactNode}
   */
  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;

      // If a custom fallback component is provided, use it
      if (fallback) {
        return fallback(this.state.error, this.state.errorInfo);
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <h2>{TEXT.errorBoundary.heading}</h2>
          <p>
            {TEXT.errorBoundary.message}
          </p>
          {this.props.showDetails && (
            <details>
              <summary>{TEXT.errorBoundary.detailsSummary}</summary>
              <p>{this.state.error && this.state.error.toString()}</p>
              <div>
                {this.state.errorInfo &&
                  this.state.errorInfo.componentStack.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))
                }
              </div>
            </details>
          )}
          <button
            className="error-boundary-button"
            onClick={() => window.location.reload()}
          >
            {TEXT.errorBoundary.refreshButton}
          </button>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
