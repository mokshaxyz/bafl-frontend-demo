import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logger from '../utils/logger';

const errorLogger = logger.createChildLogger('GlobalErrorHandler');

// Global error handler that listens for 500 server errors
// Dispatches custom event 'app:navigate-500' with error message
// Navigates user to /500 error page while preserving error context
export default function GlobalErrorHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => {
      const message = e?.detail?.message;
      errorLogger.error('Global error handler triggered', null, { message, from: location.pathname });
      // Use replace navigation to avoid stacking history when already on /500
      const replace = location.pathname === '/500';
      navigate('/500', { replace, state: { from: location, error: message } });
    };

    // Listen for custom app error events
    window.addEventListener('app:navigate-500', handler);
    return () => window.removeEventListener('app:navigate-500', handler);
  }, [navigate, location]);

  return null; // This component only handles navigation, renders nothing
}
