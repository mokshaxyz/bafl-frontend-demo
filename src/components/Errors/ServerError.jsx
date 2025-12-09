import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ErrorPage.css';

function ServerError() {
  const navigate = useNavigate();
  const location = useLocation();
  let message = location.state?.error || 'The server is unavailable or encountered an error.';
  if (!location.state?.error) {
    try {
      const stored = sessionStorage.getItem('lastServerError');
      if (stored) message = stored;
    } catch (e) {
      // ignore storage errors
    }
  }

  return (
    <div className="error-page" role="alert" aria-live="assertive">
      <div className="error-card">
        <div className="error-code">500</div>
        <h1 className="error-title">Server error</h1>
        <p className="error-message">{message}</p>
        <div className="error-actions">
          <button className="error-button" onClick={() => navigate(0)}>
            Retry
          </button>
          <button className="error-button secondary" onClick={() => navigate('/login', { replace: true })}>
            Go to Login
          </button>
        </div>
        <p className="error-footnote">If the problem persists, contact your administrator.</p>
      </div>
    </div>
  );
}

export default ServerError;
