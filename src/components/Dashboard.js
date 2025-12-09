import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import PhysicalAssessment from './PhysicalAssessment';
import PhysicalAssessmentReport from './Reports/PhysicalAssessment/PhysicalAssessmentReport';
import AttendanceMark from './Attendance/AttendanceMark';
import AttendanceViewEdit from './Attendance/AttendanceViewEdit';
import AttendanceSummary from './Attendance/AttendanceSummary';
import InvoicePage from './Invoice/InvoicePage';
import BlankInvoicePage from './Invoice/BlankInvoicePage';
import { useAuth } from '../context/AuthContext';
import logger from '../utils/logger';

const dashboardLogger = logger.createChildLogger('Dashboard');

// Dashboard with top Navbar
function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Sidebar and section state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState('dashboard');

  // Initialize sidebar state based on screen size
  useEffect(() => {
    dashboardLogger.logComponentLifecycle('Dashboard', 'mounted', { user: user?.username });
    const mq = window.matchMedia('(max-width: 768px)');
    const setByMedia = () => {
      setIsMobile(mq.matches);
      setSidebarOpen(!mq.matches);
      dashboardLogger.debug('Screen size changed', { isMobile: mq.matches });
    };
    setByMedia();
    mq.addEventListener('change', setByMedia);
    return () => {
      dashboardLogger.logComponentLifecycle('Dashboard', 'unmounted');
      mq.removeEventListener('change', setByMedia);
    };
  }, []);

  // Sync active section with URL when Dashboard mounts or URL changes
  useEffect(() => {
    const path = location.pathname || '';
    if (path.startsWith('/attendance/mark')) setActive('attendance-mark');
    else if (path.startsWith('/attendance/view-edit')) setActive('attendance-view-edit');
    else if (path.startsWith('/attendance/summary')) setActive('attendance-summary');
    else if (path.startsWith('/reports/physical-assessment')) setActive('reports-physical-assessment');
    else if (path.startsWith('/invoice-template')) setActive('invoice-template');
    else if (path.startsWith('/invoice')) setActive('invoice-standard');
    else if (path.startsWith('/reports')) setActive('reports');
    else if (path.startsWith('/dashboard')) setActive('dashboard');
  }, [location.pathname]);

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const handleSelect = useCallback((key) => {
    dashboardLogger.info('Dashboard section changed', { to: key });
    setActive(key);
    // Auto-close on mobile after selecting an item
    if (window.matchMedia('(max-width: 768px)').matches) {
      setSidebarOpen(false);
    }
  }, []);

  const profileName = user?.email || 'Guest';
  const profileImageSrc = '/demo_profile_pic.png';

  const Section = useMemo(() => {
    const Title = ({ children }) => (
      <h2 style={{ marginTop: 0, color: 'var(--color-charcoal)' }}>{children}</h2>
    );
    const Box = ({ children }) => (
      <div
        style={{
          background: 'var(--color-cream)',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: 12,
          padding: 16,
        }}
      >
        {children}
      </div>
    );
    switch (active) {
      case 'attendance':
      case 'attendance-mark':
        return () => <AttendanceMark />;
      case 'attendance-view-edit':
        return () => <AttendanceViewEdit />;
      case 'attendance-summary':
        return () => <AttendanceSummary />;
      case 'invoice-standard':
        return () => <InvoicePage />;
      case 'invoice-template':
        return () => <BlankInvoicePage />;
      case 'physical-assessment':
        return () => <PhysicalAssessment />;
      case 'reports-physical-assessment':
        return () => <PhysicalAssessmentReport />;
      case 'archery-assessment':
        return () => (
          <>
            <Title>Archery Assessment</Title>
            <Box>Archery assessment section content goes here.</Box>
          </>
        );
      case 'performance':
        return () => (
          <>
            <Title>Performance</Title>
            <Box>Performance section content goes here.</Box>
          </>
        );
      case 'tournaments':
        return () => (
          <>
            <Title>Tournaments</Title>
            <Box>Tournaments section content goes here.</Box>
          </>
        );
      case 'reports':
        return () => (
          <>
            <Title>Reports</Title>
            <Box>Reports section content goes here.</Box>
          </>
        );
      case 'dashboard':
      default:
        return () => (
          <>
            <Title>Dashboard</Title>
            <Box>Welcome to the dashboard.</Box>
          </>
        );
    }
  }, [active]);

  return (
    <div>
      <Navbar
        logoSrc={`${process.env.PUBLIC_URL}/BAFL_Logo.svg`}
        logoAlt="BAFL"
        profileName={profileName}
        profileImageSrc={profileImageSrc}
        onMenuToggle={toggleSidebar}
        menuOpen={sidebarOpen}
        onProfileClick={() => console.log('Profile button clicked')}
        onLogout={() => {
          logout();
          navigate('/login', { replace: true });
        }}
      />

      {/* Sidebar + Content layout */}
      <Sidebar
        open={sidebarOpen}
        active={active}
        onToggle={toggleSidebar}
        onSelect={handleSelect}
      />

      <main
        className={`with-sidebar__content${!isMobile && sidebarOpen ? ' has-left-gutter' : ''}`}
        style={{
          padding: 16,
          // Inline fallback: if CSS class fails for any reason, apply margin directly
          marginLeft: !isMobile && sidebarOpen ? 'var(--sidebar-width)' : 0,
        }}
      >
        <Section />
      </main>
    </div>
  );
}

export default Dashboard;
// (Removed duplicate minimal component definition)
