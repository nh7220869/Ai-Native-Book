import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * SessionDebug Component
 *
 * Shows detailed session information for debugging
 * Only visible in development or when specifically enabled
 *
 * Usage: Add to any page with <SessionDebug />
 */
export default function SessionDebug() {
  const { user, session, isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);
  const [cookieInfo, setCookieInfo] = useState(null);

  useEffect(() => {
    // Check localStorage
    const sessionData = localStorage.getItem('ai_book_session');
    const userData = localStorage.getItem('ai_book_user');
    const timestamp = localStorage.getItem('ai_book_session_timestamp');

    setStorageInfo({
      hasSession: !!sessionData,
      hasUser: !!userData,
      timestamp: timestamp ? new Date(parseInt(timestamp)).toLocaleString() : 'N/A',
      age: timestamp ? Math.floor((Date.now() - parseInt(timestamp)) / 1000 / 60) : 0
    });

    // Check cookies
    const cookies = document.cookie.split(';').map(c => c.trim());
    const authCookies = cookies.filter(c =>
      c.includes('better-auth') ||
      c.includes('session') ||
      c.includes('auth')
    );

    setCookieInfo({
      total: cookies.length,
      authCookies: authCookies.length,
      cookieNames: authCookies.map(c => c.split('=')[0])
    });
  }, [user, session]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 15px',
          backgroundColor: '#4a5568',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '12px',
          zIndex: 9999,
          opacity: 0.7,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.7'}
      >
        🔍 Session Debug
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      maxHeight: '500px',
      backgroundColor: '#1a202c',
      color: '#e2e8f0',
      border: '1px solid #4a5568',
      borderRadius: '12px',
      padding: '20px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      overflow: 'auto',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>🔍 Session Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#e2e8f0',
            cursor: 'pointer',
            fontSize: '18px',
            padding: 0
          }}
        >
          ✕
        </button>
      </div>

      {/* Authentication Status */}
      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#2d3748', borderRadius: '6px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#90cdf4' }}>Authentication Status</div>
        <div>Authenticated: <span style={{ color: isAuthenticated ? '#48bb78' : '#f56565' }}>
          {isAuthenticated ? '✅ Yes' : '❌ No'}
        </span></div>
      </div>

      {/* User Info */}
      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#2d3748', borderRadius: '6px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#90cdf4' }}>User Info</div>
        {user ? (
          <>
            <div>ID: {user.id}</div>
            <div>Email: {user.email}</div>
            <div>Name: {user.name || 'N/A'}</div>
          </>
        ) : (
          <div style={{ color: '#fc8181' }}>No user data</div>
        )}
      </div>

      {/* Session Info */}
      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#2d3748', borderRadius: '6px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#90cdf4' }}>Session Info</div>
        {session ? (
          <>
            <div>Session ID: {session.id?.substring(0, 20)}...</div>
            <div>Created: {session.createdAt ? new Date(session.createdAt).toLocaleString() : 'N/A'}</div>
            <div>Expires: {session.expiresAt ? new Date(session.expiresAt).toLocaleString() : 'N/A'}</div>
          </>
        ) : (
          <div style={{ color: '#fc8181' }}>No session data</div>
        )}
      </div>

      {/* LocalStorage Info */}
      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#2d3748', borderRadius: '6px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#90cdf4' }}>LocalStorage Backup</div>
        {storageInfo && (
          <>
            <div>Session stored: <span style={{ color: storageInfo.hasSession ? '#48bb78' : '#f56565' }}>
              {storageInfo.hasSession ? '✅ Yes' : '❌ No'}
            </span></div>
            <div>User stored: <span style={{ color: storageInfo.hasUser ? '#48bb78' : '#f56565' }}>
              {storageInfo.hasUser ? '✅ Yes' : '❌ No'}
            </span></div>
            <div>Saved: {storageInfo.timestamp}</div>
            <div>Age: {storageInfo.age} minutes</div>
          </>
        )}
      </div>

      {/* Cookie Info */}
      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#2d3748', borderRadius: '6px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#90cdf4' }}>Cookies</div>
        {cookieInfo && (
          <>
            <div>Total cookies: {cookieInfo.total}</div>
            <div>Auth cookies: <span style={{ color: cookieInfo.authCookies > 0 ? '#48bb78' : '#f56565' }}>
              {cookieInfo.authCookies}
            </span></div>
            {cookieInfo.cookieNames.length > 0 && (
              <div style={{ marginTop: '5px', fontSize: '10px' }}>
                {cookieInfo.cookieNames.map((name, i) => (
                  <div key={i}>• {name}</div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          🔄 Reload Page
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            document.cookie.split(";").forEach(c => {
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            window.location.reload();
          }}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: '#f56565',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          🗑️ Clear All
        </button>
      </div>

      <div style={{ marginTop: '15px', fontSize: '10px', opacity: 0.6, textAlign: 'center' }}>
        Press F12 to see console logs
      </div>
    </div>
  );
}
