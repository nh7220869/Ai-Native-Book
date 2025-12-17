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
    minHeight: '85vh',
    padding: '20px',
  },
  card: {
    backgroundColor: 'var(--ifm-background-color)',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    maxWidth: '500px',
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
    marginBottom: '18px',
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
  select: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: 'var(--ifm-background-surface-color)',
    color: 'var(--ifm-font-color-base)',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: 'var(--ifm-background-surface-color)',
    color: 'var(--ifm-font-color-base)',
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: 'var(--ifm-color-primary)',
    boxShadow: '0 0 0 3px var(--ifm-color-primary-lighter)',
  },
  inputError: {
    borderColor: 'var(--ifm-color-danger)',
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
  fieldError: {
    color: 'var(--ifm-color-danger)',
    fontSize: '0.8rem',
    marginTop: '4px',
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
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '24px',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--ifm-color-emphasis-200)',
    color: 'var(--ifm-font-color-base)',
  },
  hint: {
    fontSize: '0.8rem',
    color: 'var(--ifm-color-emphasis-600)',
    marginTop: '4px',
  },
  checkboxGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '8px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  checkboxLabelSelected: {
    borderColor: 'var(--ifm-color-primary)',
    backgroundColor: 'var(--ifm-color-primary-lightest)',
  },
};

const SOFTWARE_OPTIONS = [
  'Python',
  'JavaScript/TypeScript',
  'C/C++',
  'ROS/ROS2',
  'Machine Learning',
  'Computer Vision',
  'None',
];

const HARDWARE_OPTIONS = [
  'Arduino',
  'Raspberry Pi',
  'NVIDIA Jetson',
  'Microcontrollers',
  'Sensors & Actuators',
  '3D Printing',
  'PCB Design',
  'None',
];

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    softwareBackground: [],
    hardwareBackground: [],
    experienceLevel: 'beginner',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { signup, isAuthenticated, loading } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const { siteConfig } = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl || '/';

  // Get redirect URL from query params or default to docs/intro (internal book page)
  const getRedirectUrl = () => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    // Default to the internal book page after signup
    return redirect || `${baseUrl}docs/`;
  };

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const redirectUrl = getRedirectUrl();
      history.push(redirectUrl);
    }
  }, [isAuthenticated, loading, history]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signup(
        formData.name.trim(),
        formData.email.trim().toLowerCase(),
        formData.password,
        {
          softwareBackground: formData.softwareBackground.join(', '),
          hardwareBackground: formData.hardwareBackground.join(', '),
          experienceLevel: formData.experienceLevel,
        }
      );

      if (result.success) {
        // Redirect immediately to internal book page - no delay needed
        const redirectUrl = getRedirectUrl();
        history.push(redirectUrl);
      } else {
        setSubmitError(result.error || 'Signup failed. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setSubmitError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Sign Up" description="Create a new account">
        <main style={styles.container}>
          <div>Loading...</div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout title="Sign Up" description="Create a new account">
      <main style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join the Physical AI & Robotics community</p>

          {submitError && <div style={styles.error}>{submitError}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Basic Info Section */}
            <div style={styles.formGroup}>
              <label htmlFor="name" style={styles.label}>
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your full name"
                disabled={isSubmitting}
                style={{
                  ...styles.input,
                  ...(focusedField === 'name' ? styles.inputFocus : {}),
                  ...(errors.name ? styles.inputError : {}),
                }}
              />
              {errors.name && <div style={styles.fieldError}>{errors.name}</div>}
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your email"
                disabled={isSubmitting}
                style={{
                  ...styles.input,
                  ...(focusedField === 'email' ? styles.inputFocus : {}),
                  ...(errors.email ? styles.inputError : {}),
                }}
              />
              {errors.email && <div style={styles.fieldError}>{errors.email}</div>}
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Create a password (min. 8 characters)"
                disabled={isSubmitting}
                style={{
                  ...styles.input,
                  ...(focusedField === 'password' ? styles.inputFocus : {}),
                  ...(errors.password ? styles.inputError : {}),
                }}
              />
              {errors.password && <div style={styles.fieldError}>{errors.password}</div>}
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                placeholder="Confirm your password"
                disabled={isSubmitting}
                style={{
                  ...styles.input,
                  ...(focusedField === 'confirmPassword' ? styles.inputFocus : {}),
                  ...(errors.confirmPassword ? styles.inputError : {}),
                }}
              />
              {errors.confirmPassword && (
                <div style={styles.fieldError}>{errors.confirmPassword}</div>
              )}
            </div>

            {/* Background Section */}
            <h3 style={styles.sectionTitle}>Your Background (Optional)</h3>
            <p style={styles.hint}>
              Help us personalize your learning experience by sharing your background.
            </p>

            <div style={styles.formGroup}>
              <label style={styles.label}>Experience Level</label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                style={styles.select}
                disabled={isSubmitting}
              >
                <option value="beginner">Beginner - New to robotics & AI</option>
                <option value="intermediate">Intermediate - Some experience</option>
                <option value="advanced">Advanced - Professional/Expert</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Software Background</label>
              <div style={styles.checkboxGroup}>
                {SOFTWARE_OPTIONS.map((option) => (
                  <label
                    key={option}
                    style={{
                      ...styles.checkboxLabel,
                      ...(formData.softwareBackground.includes(option)
                        ? styles.checkboxLabelSelected
                        : {}),
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.softwareBackground.includes(option)}
                      onChange={() => handleCheckboxChange('softwareBackground', option)}
                      disabled={isSubmitting}
                      style={{ display: 'none' }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Hardware Background</label>
              <div style={styles.checkboxGroup}>
                {HARDWARE_OPTIONS.map((option) => (
                  <label
                    key={option}
                    style={{
                      ...styles.checkboxLabel,
                      ...(formData.hardwareBackground.includes(option)
                        ? styles.checkboxLabelSelected
                        : {}),
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.hardwareBackground.includes(option)}
                      onChange={() => handleCheckboxChange('hardwareBackground', option)}
                      disabled={isSubmitting}
                      style={{ display: 'none' }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.button,
                ...(isSubmitting ? styles.buttonDisabled : {}),
              }}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={{ margin: 0, color: 'var(--ifm-color-emphasis-600)' }}>
              Already have an account?{' '}
              <Link to="/login" style={styles.link}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default Signup;
