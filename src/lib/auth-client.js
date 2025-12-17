import { createAuthClient } from 'better-auth/react';
import { getApiBaseUrl } from '../config/api';

// Create the Better Auth client with centralized API configuration
// Uses API_BASE_URL from .env - update .env for different environments
export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
  fetchOptions: {
    credentials: 'include',
  },
});

// Export the client and individual methods
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

export default authClient;
