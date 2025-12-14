import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import AppLayout from "./components/Layout/AppLayout";
import AttendanceMark from "./components/Attendance/AttendanceMark";
import AttendanceSummary from "./components/Attendance/AttendanceSummary";
import AttendanceViewEdit from "./components/Attendance/AttendanceViewEdit";
import InvoicePage from "./components/Invoice/InvoicePage";
import BlankInvoicePage from "./components/Invoice/BlankInvoicePage";
import PhysicalAssessmentReport from "./components/Reports/PhysicalAssessment/PhysicalAssessmentReport";
import ProtectedRoute from "./components/ProtectedRoute";
import GlobalErrorHandler from "./components/GlobalErrorHandler";
import logger from "./utils/logger";

const appLogger = logger.createChildLogger("App");
appLogger.info("Application initialized", {
  environment: process.env.NODE_ENV,
  logLevel: process.env.REACT_APP_LOG_LEVEL,
});

function App() {
  return (
    <div className="App">
      <main>
        {/* Global error handler listens for 500 errors and navigates to error page */}
        <GlobalErrorHandler />
        <Routes>
          {/* Public login page (no authentication required) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes: wrapped with ProtectedRoute to ensure user is authenticated */}
          {/* AppLayout provides navigation structure (Sidebar, Navbar) for all protected pages */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/attendance/mark" element={<AttendanceMark />} />
            <Route path="/attendance/view-edit" element={<AttendanceViewEdit />} />
            <Route path="/attendance/summary" element={<AttendanceSummary />} />
            <Route path="/reports/physical-assessment" element={<PhysicalAssessmentReport />} />
            <Route path="/invoice" element={<InvoicePage />} />
            <Route path="/invoice-template" element={<BlankInvoicePage />} />
          </Route>

          {/* Default and fallback routes redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;