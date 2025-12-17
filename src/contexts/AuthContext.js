import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authClient } from '../lib/auth-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data, error } = await authClient.getSession();

        if (data && !error) {
          setSession(data.session);
          setUser(data.user);
        }
      } catch (err) {
        console.error('Error loading session:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // Sign up function
  const signup = useCallback(async (name, email, password, additionalData = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: signupError } = await authClient.signUp.email({
        name,
        email,
        password,
        softwareBackground: additionalData.softwareBackground || '',
        hardwareBackground: additionalData.hardwareBackground || '',
        experienceLevel: additionalData.experienceLevel || 'beginner',
      });

      if (signupError) {
        const errorMessage = signupError.message || 'Signup failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Set user and session from response
      if (data?.user) {
        setUser(data.user);
      }
      if (data?.session) {
        setSession(data.session);
      }

      return { success: true, user: data?.user };
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err.message || 'Network error or server unavailable';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in function
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await authClient.signIn.email({
        email,
        password,
      });

      if (loginError) {
        const errorMessage = loginError.message || 'Login failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Set user and session from response
      if (data?.user) {
        setUser(data.user);
      }
      if (data?.session) {
        setSession(data.session);
      }

      return { success: true, user: data?.user };
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Network error or server unavailable';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out function
  const logout = useCallback(async () => {
    setLoading(true);

    try {
      await authClient.signOut();

      setUser(null);
      setSession(null);
      setError(null);

      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear local state even if request fails
      setUser(null);
      setSession(null);
      return { success: true };
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await authClient.getSession();

      if (data && !error) {
        setSession(data.session);
        setUser(data.user);
        return { success: true };
      }

      setSession(null);
      setUser(null);
      return { success: false, error: 'Session expired' };
    } catch (err) {
      console.error('Error refreshing session:', err);
      return { success: false, error: 'Network error' };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    loading,
    error,
    login,
    signup,
    logout,
    refreshSession,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
