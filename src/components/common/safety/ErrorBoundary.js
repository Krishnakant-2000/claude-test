import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('🚨 Error details:', errorInfo);
    console.error('🚨 Error stack:', error.stack);
    
    // Check if this is the React error #31
    if (error.message && error.message.includes('Objects are not valid as a React child')) {
      console.error('🚨 REACT ERROR #31 DETECTED!');
      console.error('🚨 Component that caused the error:', this.props.componentName || 'Unknown');
      console.error('🚨 Full error info:', errorInfo);
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ 
          padding: '20px', 
          border: '2px solid red', 
          borderRadius: '8px',
          backgroundColor: '#ffe6e6',
          color: '#d00',
          margin: '10px'
        }}>
          <h2>Something went wrong in {this.props.componentName || 'this component'}</h2>
          <details style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '10px' }}>
            <summary>Error Details (Click to expand)</summary>
            <div style={{ marginTop: '10px' }}>
              <strong>Error:</strong> {this.state.error && this.state.error.toString()}
            </div>
            <div style={{ marginTop: '10px' }}>
              <strong>Stack:</strong> {this.state.errorInfo.componentStack}
            </div>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            style={{ 
              marginTop: '10px', 
              padding: '8px 16px', 
              backgroundColor: '#d00', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;