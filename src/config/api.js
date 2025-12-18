/**
 * API Configuration
 *
 * Centralized configuration for all API endpoints.
 * Reads from environment variables via Docusaurus siteConfig.
 *
 * Usage:
 *   import { API_CONFIG } from '@site/src/config/api';
 *   fetch(`${API_CONFIG.BASE_URL}/api/auth/sign-in/email`, {...});
 */

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

/**
 * Hook to get API configuration
 * Use this in React components
 */
export const useApiConfig = () => {
  const { siteConfig } = useDocusaurusContext();

  const baseUrl = siteConfig.customFields?.apiBaseUrl || 'http://localhost:3001';

  return {
    BASE_URL: baseUrl,
    ENDPOINTS: {
      // Authentication
      AUTH_SIGNUP: `${baseUrl}/api/auth/sign-up/email`,
      AUTH_SIGNIN: `${baseUrl}/api/auth/sign-in/email`,
      AUTH_SIGNOUT: `${baseUrl}/api/auth/sign-out`,
      AUTH_SESSION: `${baseUrl}/api/auth/session`,
      AUTH_HEALTH: `${baseUrl}/api/auth/auth-health`,

      // Translation
      TRANSLATE_GEMINI: `${baseUrl}/api/gemini/translate`,
      TRANSLATE: `${baseUrl}/api/translate`,

      // Personalization
      PERSONALIZE: `${baseUrl}/api/personalize`,

      // Chat (RAG)
      CHAT: `${baseUrl}/chat`,

      // Health
      HEALTH: `${baseUrl}/health`,
    }
  };
};

/**
 * Get API base URL (for non-React contexts)
 * Works in both browser and server environments
 */
export const getApiBaseUrl = () => {
  // Check if we're in browser
  if (typeof window !== 'undefined') {
    // Priority 1: Explicitly set in Docusaurus config
    const configUrl = window.docusaurus?.siteConfig?.customFields?.apiBaseUrl;
    if (configUrl !== undefined && configUrl !== null) {
      console.log('🔗 API Base URL from config:', configUrl || '(empty - using relative URLs)');
      return configUrl;
    }

    // Priority 2: Auto-detect Vercel production
    if (window.location.hostname.includes('vercel.app')) {
      console.log('🔗 API Base URL: Vercel detected, using relative URLs');
      return '';  // Same domain - use relative URLs
    }

    // Priority 3: Localhost development
    console.log('🔗 API Base URL: Using localhost for development');
    return 'http://localhost:3001';
  }

  // Server-side or build-time
  return '';
};

/**
 * Static API configuration (fallback for non-React contexts)
 * This uses the runtime value when available
 */
export const API_CONFIG = {
  get BASE_URL() {
    return getApiBaseUrl();
  },
  get ENDPOINTS() {
    const baseUrl = this.BASE_URL;
    return {
      // Authentication
      AUTH_SIGNUP: `${baseUrl}/api/auth/sign-up/email`,
      AUTH_SIGNIN: `${baseUrl}/api/auth/sign-in/email`,
      AUTH_SIGNOUT: `${baseUrl}/api/auth/sign-out`,
      AUTH_SESSION: `${baseUrl}/api/auth/session`,
      AUTH_HEALTH: `${baseUrl}/api/auth/auth-health`,

      // Translation
      TRANSLATE_GEMINI: `${baseUrl}/api/gemini/translate`,
      TRANSLATE: `${baseUrl}/api/translate`,

      // Personalization
      PERSONALIZE: `${baseUrl}/api/personalize`,

      // Chat (RAG)
      CHAT: `${baseUrl}/chat`,

      // Health
      HEALTH: `${baseUrl}/health`,
    };
  }
};

/**
 * Helper to build API URL
 * @param {string} endpoint - Endpoint path (e.g., '/api/auth/session')
 * @returns {string} Full URL
 */
export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};
