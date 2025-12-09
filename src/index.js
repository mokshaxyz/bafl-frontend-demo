import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { setupFetchInterceptor } from './utils/setupFetchInterceptor';
import logger from './utils/logger';

// Install global network/timeout interceptor for fetch
setupFetchInterceptor();

const mainLogger = logger.createChildLogger('Main');
mainLogger.info('BAFL Web Application starting', {
  environment: process.env.NODE_ENV,
  logLevel: process.env.REACT_APP_LOG_LEVEL,
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Performance measuring removed (reportWebVitals omitted).
