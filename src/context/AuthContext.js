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
  // Initialize from localStorage so auth persists on refresh
  const [token, setToken] = useState(() => {
    try {
      const raw = localStorage.getItem('auth');
      const parsedToken = raw ? JSON.parse(raw)?.token || null : null;
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
      localStorage.setItem('auth', JSON.stringify({ token: nextToken, user: nextUser }));
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

  const extractToken = (data) => (
    data?.token || data?.accessToken || data?.jwt || data?.data?.token || null
  );

  const extractUser = (data, fallbackUsername) => (
    data?.user || data?.data?.user || (fallbackUsername ? { username: fallbackUsername } : null)
  );

  const login = async (username, password) => {
    authLogger.logAuth('Login attempt', { username });
  const url = buildUrl(API_BASE_URL, LOGIN_PATH); // If API_BASE_URL === '' (dev proxy), this becomes '/api/v1/auth/login'
    authLogger.logRequest('POST', url, { username });
    setLoading(true);
    try {
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
      // Re-throw after clearing any stale session on auth errors (4xx)
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
