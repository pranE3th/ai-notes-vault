import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full text-center p-6">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-red-500">⚠️</h1>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">
                Something went wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                The application encountered an error.
              </p>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="text-left bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
                <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                  Error Details:
                </h3>
                <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto">
                  {this.state.error && this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
              
              <div>
                <a
                  href="/"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Go to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
