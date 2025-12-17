import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useHistory, useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '../contexts/AuthContext';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    padding: '20px',
  },
  card: {
    backgroundColor: 'var(--ifm-background-color)',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    maxWidth: '420px',
    width: '100%',
    border: '1px solid var(--ifm-color-emphasis-200)',
  },
  title: {
    textAlign: 'center',
    marginBottom: '8px',
    fontSize: '1.8rem',
    fontWeight: '600',
    color: 'var(--ifm-font-color-base)',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '30px',
    color: 'var(--ifm-color-emphasis-600)',
    fontSize: '0.95rem',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: 'var(--ifm-font-color-base)',
    fontSize: '0.9rem',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: 'var(--ifm-background-surface-color)',
    color: 'var(--ifm-font-color-base)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: 'var(--ifm-color-primary)',
    boxShadow: '0 0 0 3px var(--ifm-color-primary-lighter)',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'var(--ifm-color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s, transform 0.1s',
    marginTop: '10px',
  },
  buttonDisabled: {
    backgroundColor: 'var(--ifm-color-emphasis-400)',
    cursor: 'not-allowed',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '0.9rem',
    border: '1px solid #fecaca',
  },
  success: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '0.9rem',
    border: '1px solid #bbf7d0',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid var(--ifm-color-emphasis-200)',
  },
  link: {
    color: 'var(--ifm-color-primary)',
    textDecoration: 'none',
    fontWeight: '500',
  },
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { login, isAuthenticated, loading } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const { siteConfig } = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl || '/';

  // Get redirect URL from query params or default to docs/intro (internal book page)
  const getRedirectUrl = () => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    // Default to the internal book page after login
    return redirect || `${baseUrl}docs`;
  };

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const redirectUrl = getRedirectUrl();
      history.push(redirectUrl);
    }
  }, [isAuthenticated, loading, history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    // Basic validation
    if (!email.trim()) {
      setError('Email is required');
      setIsSubmitting(false);
      return;
    }

    if (!password) {
      setError('Password is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        // Redirect immediately to internal book page - no delay needed
        const redirectUrl = getRedirectUrl();
        history.push(redirectUrl);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Log In" description="Log in to your account">
        <main style={styles.container}>
          <div>Loading...</div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout title="Log In" description="Log in to your account">
      <main style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to continue to Physical AI Book</p>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your email"
                disabled={isSubmitting}
                style={{
                  ...styles.input,
                  ...(focusedField === 'email' ? styles.inputFocus : {}),
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your password"
                disabled={isSubmitting}
                style={{
                  ...styles.input,
                  ...(focusedField === 'password' ? styles.inputFocus : {}),
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.button,
                ...(isSubmitting ? styles.buttonDisabled : {}),
              }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={{ margin: 0, color: 'var(--ifm-color-emphasis-600)' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={styles.link}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default Login;
