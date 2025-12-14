import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logger from '../utils/logger';

const protectedLogger = logger.createChildLogger('ProtectedRoute');

// Wrapper component that ensures only authenticated users can access routes
// Redirects unauthenticated users to login page while preserving their destination
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication status
  if (loading) {
    protectedLogger.debug('Authentication loading', { path: location.pathname });
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div>;
  }

  // Redirect to login if not authenticated, preserving destination for post-login redirect
  if (!isAuthenticated) {
    protectedLogger.warn('Unauthorized access attempt, redirecting to login', { 
      attemptedPath: location.pathname 
    });
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // User is authenticated, render the protected component
  protectedLogger.debug('Access granted to protected route', { path: location.pathname });
  return children;
}

export default ProtectedRoute;
