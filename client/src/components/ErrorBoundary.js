import React, { Component } from 'react';
import './ErrorBoundary.scss';
import { TEXT } from '../localization/text';

/**
 * ErrorBoundary component for catching and handling React component errors
 * Prevents the entire app from crashing due to errors in a single component
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

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    this.setState({ errorInfo });

    // Optional: send error to your error tracking service
    // reportError(error, errorInfo);
  }

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
