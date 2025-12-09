import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPage.css';

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-code">404</div>
        <h1 className="error-title">Page not found</h1>
        <p className="error-message">The page you are looking for doesn't exist or was moved.</p>
        <div className="error-actions">
          <button className="error-button" onClick={() => navigate(-1)}>
            Go back
          </button>
          <button className="error-button secondary" onClick={() => navigate('/login', { replace: true })}>
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
