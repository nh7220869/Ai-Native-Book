import React from 'react';
import { useHistory, useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedContent - Wraps content that requires authentication
 * Shows a login prompt overlay if user is not authenticated
 */
const ProtectedContent = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const { siteConfig } = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl || '/';

  const handleSignup = () => {
    const currentPath = location.pathname;
    history.push(`${baseUrl}signup?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleLogin = () => {
    const currentPath = location.pathname;
    history.push(`${baseUrl}login?redirect=${encodeURIComponent(currentPath)}`);
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // If authenticated, show the content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated, show login prompt overlay
  return (
    <div style={{ position: 'relative', minHeight: '60vh' }}>
      {/* Blurred preview of content */}
      <div style={{ filter: 'blur(8px)', pointerEvents: 'none', opacity: 0.3 }}>
        {children}
      </div>

      {/* Login prompt overlay */}
      <div className="protected-content-overlay">
        <div className="protected-content-container">
          <div className="protected-content-icon">🔒</div>
          <h2 className="protected-content-title">Sign in to Access Content</h2>
          <p className="protected-content-description">
            Create a free account to read the complete book on Physical AI & Humanoid Robotics.
            We'll personalize your learning experience based on your background.
          </p>
          <div className="protected-content-button-group">
            <button className="protected-content-primary-button" onClick={handleSignup}>
              Create Free Account
            </button>
            <button className="protected-content-secondary-button" onClick={handleLogin}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedContent;
