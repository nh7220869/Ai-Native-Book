import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { getGravatarUrl } from '../../utils/gravatar';

// Styles
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Higher than navbar (navbar is typically 1000-1050)
    overflowY: 'auto', // Allow scrolling on mobile if content is too tall
  },
  content: {
    backgroundColor: 'var(--ifm-background-color)',
    padding: '30px',
    borderRadius: '12px',
    minWidth: '340px',
    maxWidth: '400px',
    width: '90%', // Responsive width on mobile
    maxHeight: '90vh', // Prevent overflow on short screens
    overflowY: 'auto', // Allow scrolling within modal if needed
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    position: 'relative',
    color: 'var(--ifm-font-color-base)',
    border: '1px solid var(--ifm-color-emphasis-200)',
    margin: '20px', // Add margin for better spacing
  },
  closeButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'var(--ifm-font-color-base)',
    lineHeight: 1,
  },
  title: {
    marginBottom: '20px',
    fontSize: '1.5rem',
    fontWeight: '600',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '500',
    fontSize: '0.9rem',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: '6px',
    fontSize: '1rem',
    backgroundColor: 'var(--ifm-background-surface-color)',
    color: 'var(--ifm-font-color-base)',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'var(--ifm-color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '8px',
  },
  buttonDisabled: {
    backgroundColor: 'var(--ifm-color-emphasis-400)',
    cursor: 'not-allowed',
  },
  error: {
    color: '#dc2626',
    fontSize: '0.85rem',
    marginBottom: '12px',
    padding: '8px 12px',
    backgroundColor: '#fee2e2',
    borderRadius: '4px',
  },
  footer: {
    marginTop: '16px',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
  link: {
    color: 'var(--ifm-color-primary)',
    cursor: 'pointer',
    textDecoration: 'none',
  },
};

// Modal Component with body scroll lock
const Modal = ({ show, onClose, children }) => {
  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (show) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Unlock body scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [show]);

  if (!show) return null;

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={modalStyles.closeButton}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

// Login Form
const LoginForm = ({ onSuccess, onClose, onSwitchToSignup }) => {
  const { login } = useAuth();
  const history = useHistory();
  const { siteConfig } = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        onSuccess();
        onClose();
        // Redirect to internal book page immediately
        history.push(`${baseUrl}docs`);
      } else {
        setError(result.error || 'Login failed');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={modalStyles.title}>Welcome Back</h2>
      {error && <div style={modalStyles.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={modalStyles.input}
            placeholder="Enter your email"
            disabled={isSubmitting}
            required
          />
        </div>
        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={modalStyles.input}
            placeholder="Enter password"
            disabled={isSubmitting}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            ...modalStyles.button,
            ...(isSubmitting ? modalStyles.buttonDisabled : {}),
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <div style={modalStyles.footer}>
        Don't have an account?{' '}
        <span style={modalStyles.link} onClick={onSwitchToSignup}>
          Sign up
        </span>
      </div>
    </div>
  );
};

// Signup Form - Simplified for modal
const SignupForm = ({ onSuccess, onClose, onSwitchToLogin }) => {
  const history = useHistory();
  const { siteConfig } = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl || '/';

  const goToSignupPage = () => {
    onClose();
    history.push(`${baseUrl}signup`);
  };

  return (
    <div>
      <h2 style={modalStyles.title}>Create Account</h2>
      <p style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--ifm-color-emphasis-600)' }}>
        Sign up to personalize your learning experience with your software and hardware background.
      </p>
      <button
        onClick={goToSignupPage}
        style={modalStyles.button}
      >
        Go to Sign Up Page
      </button>
      <div style={modalStyles.footer}>
        Already have an account?{' '}
        <span style={modalStyles.link} onClick={onSwitchToLogin}>
          Sign in
        </span>
      </div>
    </div>
  );
};

// Profile Avatar Component - shows image or first letter fallback
const ProfileAvatar = ({ user, size = 32 }) => {
  const [imageError, setImageError] = useState(false);

  // Get first letter of name (always uppercase)
  const getInitial = () => {
    if (user?.name && user.name.trim()) {
      return user.name.trim().charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Check if we should try to load an image
  const hasImage = user?.image || user?.email;
  const showInitial = !hasImage || imageError;

  // Get profile image URL - use user image or Gravatar based on email
  const getProfileImageUrl = () => {
    if (user?.image) {
      return user.image;
    }
    if (user?.email) {
      // Use Gravatar with 404 fallback to trigger error handler
      return getGravatarUrl(user.email, size * 2, '404');
    }
    return null;
  };

  if (showInitial) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: 'var(--ifm-color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '600',
          fontSize: `${size * 0.5}px`,
          border: '2px solid var(--ifm-color-primary-dark)',
        }}
      >
        {getInitial()}
      </div>
    );
  }

  return (
    <img
      src={getProfileImageUrl()}
      alt={`${user?.name || 'User'}'s avatar`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid var(--ifm-color-primary)',
      }}
      onError={() => setImageError(true)}
    />
  );
};

// User Menu Dropdown
const UserMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="navbar__item navbar__link"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <ProfileAvatar user={user} size={32} />
        <span>{user?.name || 'User'}</span>
      </button>

      
{isOpen && (
  <div
    style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      backgroundColor: isDarkTheme ? 'var(--ifm-background-color)' : '#f8f9fa',
      border: '1px solid var(--ifm-color-emphasis-200)',
      borderRadius: '8px',
      boxShadow: 'var(--ifm-global-shadow-lw)',
      minWidth: '220px',
      zIndex: 1000,
    }}
  >
    {/* Rest of your existing component remains exactly the same */}
    <div
      style={{
        padding: '16px',
        borderBottom: '1px solid var(--ifm-color-emphasis-200)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <ProfileAvatar user={user} size={48} />
      <div>
        <div style={{ 
          fontWeight: '600', 
          marginBottom: '2px',
          color: 'var(--ifm-color-emphasis-900)' 
        }}>
          {user?.name}
        </div>
        <div style={{ 
          fontSize: '0.8rem', 
          color: 'var(--ifm-color-emphasis-600)' 
        }}>
          {user?.email}
        </div>
        {user?.experienceLevel && (
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--ifm-color-primary)',
            marginTop: '4px' 
          }}>
            {user.experienceLevel.charAt(0).toUpperCase() + user.experienceLevel.slice(1)} Level
          </div>
        )}
      </div>
    </div>
    <button
      onClick={onLogout}
      style={{
        width: '100%',
        padding: '10px 16px',
        background: 'none',
        border: 'none',
        textAlign: 'left',
        cursor: 'pointer',
        color: 'var(--ifm-color-danger)',
        fontSize: '0.9rem',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      Sign Out
    </button>
  </div>
)}
    </div>
  );
};

// Main Component
const CustomAuthNavbarItem = ({ className }) => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleLoginSuccess = () => {
    // Success - modal will close
  };

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  if (loading) {
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)' }}>
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {isAuthenticated ? (
        <UserMenu user={user} onLogout={handleLogout} />
      ) : (
        <>
          <button
            className="button button--secondary button--sm"
            onClick={() => setShowSignupModal(true)}
          >
            Sign Up
          </button>
          <button
            className="button button--primary button--sm"
            onClick={() => setShowLoginModal(true)}
          >
            Log In
          </button>
        </>
      )}

      <Modal show={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <LoginForm
          onSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={switchToSignup}
        />
      </Modal>

      <Modal show={showSignupModal} onClose={() => setShowSignupModal(false)}>
        <SignupForm
          onSuccess={handleLoginSuccess}
          onClose={() => setShowSignupModal(false)}
          onSwitchToLogin={switchToLogin}
        />
      </Modal>
    </div>
  );
};

export default CustomAuthNavbarItem;
