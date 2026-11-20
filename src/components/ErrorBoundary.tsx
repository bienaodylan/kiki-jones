import React from 'react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || 'An unexpected error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-black flex items-center justify-center p-6">
          <div className="max-w-md w-full border border-black bg-white p-8 space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/60">KIKI JONES System Notice</p>
            <h1 className="font-editorial text-3xl text-black">Something needs attention</h1>
            <p className="text-sm font-light text-black/75 leading-relaxed">
              We encountered an unexpected error while loading this view. Please refresh or return to the storefront.
            </p>
            <pre className="text-[11px] bg-black/[0.03] p-3 border border-black/15 overflow-x-auto text-black/80">
              {this.state.message}
            </pre>
            <button
              onClick={() => window.location.assign('/')}
              className="w-full py-3 px-6 bg-black text-white text-xs font-bold uppercase tracking-[0.18em] hover:bg-black/85 transition-colors cursor-pointer"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
