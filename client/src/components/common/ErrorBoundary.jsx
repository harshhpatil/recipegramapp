import React from 'react';

/**
 * ErrorBoundary - Catches errors in child components and displays fallback UI
 * Prevents uncaught exceptions from crashing the entire application
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-warmGray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-warmGray-600 mb-6">
                We encountered an unexpected error. Please refresh the page and try again.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-6 p-4 bg-red-50 rounded text-left border border-red-200">
                  <p className="text-xs font-mono text-red-700 mb-2 font-semibold">
                    Error Details (Development Only):
                  </p>
                  <p className="text-xs text-red-600 mb-2 break-words">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-3">
                      <summary className="text-xs font-semibold text-red-600 cursor-pointer hover:text-red-700">
                        Stack Trace
                      </summary>
                      <pre className="text-xs text-red-600 mt-2 overflow-auto max-h-40 bg-white p-2 rounded border border-red-100">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="mt-6 w-full px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors duration-200"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
