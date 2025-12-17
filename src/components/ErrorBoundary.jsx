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
    console.error('Error caught by boundary:', error, errorInfo);
    this.state = {
      hasError: true,
      error: error,
      errorInfo: errorInfo
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          maxWidth: '800px',
          margin: '100px auto',
          textAlign: 'center',
          backgroundColor: '#EBF4F6',
          borderRadius: '12px',
          border: '2px solid #071952'
        }}>
          <h1 style={{ color: '#071952', marginBottom: '20px' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#37474F', fontSize: '16px', marginBottom: '30px' }}>
            The application encountered an unexpected error. Please try refreshing the page.
          </p>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#071952',
                color: '#EBF4F6',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Refresh Page
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              style={{
                backgroundColor: '#088395',
                color: '#EBF4F6',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              marginTop: '30px',
              textAlign: 'left',
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #071952'
            }}>
              <summary style={{ cursor: 'pointer', color: '#071952', fontWeight: 'bold' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{
                marginTop: '10px',
                fontSize: '12px',
                color: '#37474F',
                overflow: 'auto',
                maxHeight: '300px'
              }}>
                {this.state.error && this.state.error.toString()}
                {'\n\n'}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
