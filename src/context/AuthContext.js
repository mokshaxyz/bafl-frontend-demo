import React, { createContext, useContext, useMemo, useState } from 'react';
import logger from '../utils/logger';

// Auth context with API-backed login.
const AuthContext = createContext(null);

// Create a logger instance for auth operations
const authLogger = logger.createChildLogger('AuthContext');

// Prefer configuring base URL via environment variable. Example:
// REACT_APP_API_BASE_URL=https://bafl-backend.onrender.com/api/v1
// When running in development WITH a Create React App proxy (see package.json "proxy"),
// you can leave REACT_APP_API_BASE_URL undefined and we will use a relative path to
// avoid CORS by letting the dev server proxy the request.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'development' ? '' : 'https://bafl-backend.onrender.com/api/v1');
const LOGIN_PATH = '/api/v1/auth/login';

// Safely build a URL from base and path, aligning with the Postman call
const buildUrl = (base, path) => {
  try {
    return new URL(path, base).toString();
  } catch (_) {
    // Fallback join (no double slashes)
    const trimmedBase = (base || '').replace(/\/+$/, '');
    return `${trimmedBase}${path}`;
  }
};

export function AuthProvider({ children }) {
  // Initialize token from localStorage on app load (enables session persistence on page refresh)
  // Token stored in auth object under access_token field (matches backend contract)
  const [token, setToken] = useState(() => {
    try {
      const raw = localStorage.getItem('auth');
      const parsedToken = raw ? JSON.parse(raw)?.access_token || null : null;
      if (parsedToken) {
        authLogger.info('Auth token restored from localStorage');
      } else {
        authLogger.debug('No auth token found in localStorage');
      }
      return parsedToken;
    } catch (err) {
      authLogger.error('Failed to parse auth token from localStorage', err);
      return null;
    }
  });
  // User info (name, username, role) from backend during login
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('auth');
      const parsedUser = raw ? JSON.parse(raw)?.user || null : null;
      if (parsedUser) {
        authLogger.info('User info restored from localStorage', { username: parsedUser.username });
      }
      return parsedUser;
    } catch (err) {
      authLogger.error('Failed to parse user info from localStorage', err);
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const persistAuth = (nextToken, nextUser) => {
    authLogger.logAuth('Persisting authentication', { 
      hasToken: !!nextToken, 
      username: nextUser?.username 
    });
    setToken(nextToken);
    setUser(nextUser);
    try {
      // Store both in auth object and as standalone key for API interceptor to read
      localStorage.setItem('auth', JSON.stringify({ access_token: nextToken, user: nextUser }));
      localStorage.setItem('access_token', nextToken); // Fallback for interceptor
      authLogger.debug('Auth data saved to localStorage');
    } catch (err) {
      authLogger.error('Failed to save auth data to localStorage', err);
    }
  };

  const clearAuth = () => {
    authLogger.logAuth('Clearing authentication');
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('auth');
      authLogger.debug('Auth data removed from localStorage');
    } catch (err) {
      authLogger.warn('Failed to remove auth data from localStorage', err);
    }
  };

  // Extract token from login response (backend returns token in access_token field)
  const extractToken = (data) => (
    data?.access_token || null
  );

  // Extract user info from login response (backend returns user object)
  const extractUser = (data, fallbackUsername) => (
    data?.user || data?.data?.user || (fallbackUsername ? { username: fallbackUsername } : null)
  );

  const login = async (username, password) => {
    authLogger.logAuth('Login attempt', { username });
    // Build login URL using environment variable (REACT_APP_API_BASE_URL)
    // Falls back to relative path in development (uses proxy from package.json)
    // Falls back to HTTPS backend in production
    const url = buildUrl(API_BASE_URL, LOGIN_PATH);
    authLogger.logRequest('POST', url, { username });
    setLoading(true);
    try {
      // Call login endpoint with username and password
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      let data = null;
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch (err) {
        authLogger.warn('Non-JSON response from login endpoint', { text: text?.substring(0, 100) });
        data = null;
      }

      authLogger.logResponse('POST', url, res.status, data);

      if (!res.ok) {
        const message = (data && (data.message || data.error)) || 'Invalid credentials';
        const err = new Error(message);
        err.code = res.status;
        authLogger.error('Login failed', err, { status: res.status, username });
        throw err;
      }

      // Extract token and user info from backend response
      const nextToken = extractToken(data);
      const nextUser = extractUser(data, username) || { username };
      if (!nextToken) {
        authLogger.warn('Backend did not return a token, proceeding without token', { username });
        persistAuth(null, nextUser);
        return { user: nextUser, token: null };
      }

      authLogger.logAuth('Login successful', { username, hasToken: !!nextToken });
      persistAuth(nextToken, nextUser);
      return { user: nextUser, token: nextToken };
    } catch (err) {
      // Clear stale session on auth errors (4xx status codes)
      if (typeof err?.code === 'number' && err.code >= 400 && err.code < 500) {
        authLogger.info('Clearing stale session due to auth error', { code: err.code });
        clearAuth();
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authLogger.logAuth('User logged out', { username: user?.username });
    clearAuth();
  };

  const value = useMemo(
    () => ({ user, token, isAuthenticated: !!user, loading, login, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
