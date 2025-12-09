import React from 'react';
import logger from '../utils/logger';

const errorBoundaryLogger = logger.createChildLogger('ErrorBoundary');

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error with full context
    errorBoundaryLogger.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo?.componentStack,
      errorInfo,
    });
  }

  render() {
    const { hasError, error } = this.state;
    const { fallback } = this.props;

    if (hasError) {
      if (fallback) return fallback({ error });
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b1220', color: '#e6edf3' }}>
          <div style={{ padding: '2rem', border: '1px solid #283455', borderRadius: 12, background: '#111a2e', maxWidth: 560 }}>
            <h1 style={{ marginTop: 0 }}>Something went wrong</h1>
            <p style={{ color: '#a9b5c9' }}>{error?.message || 'An unexpected error occurred.'}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                appearance: 'none', background: '#1f6feb', border: '1px solid #2f81f7', color: '#fff',
                padding: '0.6rem 1rem', borderRadius: 8, fontWeight: 600, cursor: 'pointer'
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    // eslint-disable-next-line react/destructuring-assignment
    return this.props.children;
  }
}

export default ErrorBoundary;
