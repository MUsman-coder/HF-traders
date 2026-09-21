import React from 'react';

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches any render-time error anywhere below it in the tree and shows a
 * recoverable fallback instead of letting React unmount the whole app to a
 * blank white page. Also logs the real error to the console, so if
 * something like a modal crashes on open, you'll see exactly why in
 * DevTools (F12 → Console) instead of just "it went blank."
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('HF Traders — caught a render error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6 text-center">
          <div className="max-w-md">
            <h1 className="text-white text-2xl font-semibold mb-3">Something went wrong</h1>
            <p className="text-white/60 text-sm mb-2">
              This section hit an unexpected error. Nothing else on the site is affected.
            </p>
            <p className="text-white/40 text-xs mb-6 font-mono break-all">
              {this.state.error.message}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-6 py-2.5 rounded-full border border-white/15 transition-colors"
              >
                Go Home
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
