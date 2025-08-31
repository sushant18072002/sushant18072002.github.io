import React, { Component, ErrorInfo, ReactNode } from 'react';
import Card from './Card';
import Button from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="text-center p-8 max-w-md w-full">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-primary-900 mb-4 font-['DM_Sans']">
              Something went wrong
            </h2>
            <p className="text-primary-600 mb-6 font-['Poppins']">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => window.location.reload()} 
                className="flex-1 sm:flex-none"
              >
                Refresh Page
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()} 
                className="flex-1 sm:flex-none"
              >
                Go Back
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-primary-500">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;