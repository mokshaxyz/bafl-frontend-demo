import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logger from '../utils/logger';
import './LoginPage.css';

const loginLogger = logger.createChildLogger('LoginPage');

// Login page for user authentication
// Redirects authenticated users to their original destination (or /attendance/mark by default)
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();

  // Redirect already-authenticated users to their destination or default page
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/attendance/mark';
      loginLogger.logNavigation(location.pathname, from, 'User already authenticated');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      loginLogger.warn('Login form submitted with empty fields');
      setError('Please enter both username and password.');
      return;
    }

    loginLogger.info('Login form submitted', { username });
    setSubmitting(true);
    login(username, password)
      .then((response) => {
        // AuthContext.login() persists token and user to localStorage
        // No additional storage needed here - just navigate after success
        setError('');
        const from = location.state?.from?.pathname || '/attendance/mark';
        loginLogger.info('Login successful, redirecting', { from });
        navigate(from, { replace: true });
      })
      .catch((err) => {
        const message = err?.message || 'Login failed. Please try again.';
        const status = err?.code;
        const isServerError = typeof status === 'number' && status >= 500;
        const isNetworkError = /failed to fetch|network|aborted/i.test(String(message));
        
        loginLogger.error('Login failed', err, { status, isServerError, isNetworkError });
        
        if (isServerError || isNetworkError) {
          loginLogger.logNavigation(location.pathname, '/500', 'Server or network error');
          navigate('/500', { replace: true, state: { from: location, error: message } });
          return;
        }
        setError(message);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <div className="login-logo">
          {/* Logo served from public/BAFL.png - use leading slash to reference public assets */}
          <img src="/logo_dark_theme.svg" alt="BAFL logo" className="login-logo-image" />
        </div>

        {error && (
          <h3 className="login-error" role="alert">
            {error}
          </h3>
        )}

        <label className="label" htmlFor="username">Username</label>
        <input
          id="username"
          className="input"
          type="text"
          placeholder="e.g. raghav"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />

        <label className="label" htmlFor="password">Password</label>
        <input
          id="password"
          className="input"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button type="submit" className="login-button" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Login'}
        </button>

        <div className="forgot-wrapper">
          <a className="forgot-link" href="/forgot-password">Forgot password?</a>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
