import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logger from '../utils/logger';

const errorLogger = logger.createChildLogger('GlobalErrorHandler');

// Listens for CustomEvent('app:navigate-500', { detail: { message } }) and navigates to /500
export default function GlobalErrorHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => {
      const message = e?.detail?.message;
      errorLogger.error('Global error handler triggered', null, { message, from: location.pathname });
      // Avoid stacking history when already on /500
      const replace = location.pathname === '/500';
      navigate('/500', { replace, state: { from: location, error: message } });
    };

    window.addEventListener('app:navigate-500', handler);
    return () => window.removeEventListener('app:navigate-500', handler);
  }, [navigate, location]);

  return null;
}
