import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-alert/10 border border-alert/20 rounded-2xl">
          <AlertCircle className="w-12 h-12 text-alert mb-4" />
          <h2 className="text-xl font-bold mb-2 text-white">Something went wrong</h2>
          <p className="text-text-secondary text-sm mb-4">We are having trouble loading this section.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
