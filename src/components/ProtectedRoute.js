import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logger from '../utils/logger';

const protectedLogger = logger.createChildLogger('ProtectedRoute');

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    protectedLogger.debug('Authentication loading', { path: location.pathname });
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div>;
  }

  if (!isAuthenticated) {
    protectedLogger.warn('Unauthorized access attempt, redirecting to login', { 
      attemptedPath: location.pathname 
    });
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  protectedLogger.debug('Access granted to protected route', { path: location.pathname });
  return children;
}

export default ProtectedRoute;
