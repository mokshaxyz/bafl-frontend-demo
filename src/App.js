import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ServerError from './components/Errors/ServerError';
import NotFound from './components/Errors/NotFound';
import GlobalErrorHandler from './components/GlobalErrorHandler';
import logger from './utils/logger';

const appLogger = logger.createChildLogger('App');
appLogger.info('Application initialized', { 
  environment: process.env.NODE_ENV,
  logLevel: process.env.REACT_APP_LOG_LEVEL 
});

function App() {
  return (
    <div className="App">
      <main>
        {/* Listens for global network error events and navigates to /500 */}
        <GlobalErrorHandler />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/attendance/mark"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/attendance/view-edit"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/attendance/summary"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/invoice"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/invoice-template"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/reports/physical-assessment"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/reports"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          />
          <Route path="/500" element={<ServerError />} />
          {/* Default route: redirect root to login or dashboard based on auth is handled in LoginPage */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;