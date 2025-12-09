import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

/**
 * Sidebar component
 * Props:
 * - open: boolean (controls visibility)
 * - active: string (current section key)
 * - onToggle: () => void (toggle open/closed)
 * - onSelect: (key: string) => void (select a section)
 */
export default function Sidebar({ open, active, onToggle, onSelect }) {
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && open) onToggle();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onToggle]);

  const items = [
    { key: 'dashboard', label: 'Dashboard' },
    {
      key: 'attendance',
      label: 'Attendance',
      hasSubmenu: true,
      submenu: [
        { key: 'attendance-mark', label: 'Mark Attendance', path: '/attendance/mark' },
        { key: 'attendance-view-edit', label: 'Edit Attendance', path: '/attendance/view-edit' },
        { key: 'attendance-summary', label: 'Summary', path: '/attendance/summary' }
      ]
    },
    {
      key: 'performance',
      label: 'Performance',
      hasSubmenu: true,
      submenu: [
        { key: 'physical-assessment', label: 'Physical Assessment' },
        { key: 'archery-assessment', label: 'Archery Assessment' }
      ]
    },
    { key: 'tournaments', label: 'Tournaments' },
    {
      key: 'reports',
      label: 'Reports',
      hasSubmenu: true,
      submenu: [
        { key: 'reports-physical-assessment', label: 'Physical Assessment Report', path: '/reports/physical-assessment' },
      ]
    },
    {
      key: 'invoice',
      label: 'Invoice',
      hasSubmenu: true,
      submenu: [
        { key: 'invoice-standard', label: 'Invoice Generator', path: '/invoice' },
        { key: 'invoice-template', label: 'Invoice Template', path: '/invoice-template' }
      ]
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <button
        type="button"
        className={`sidebar__backdrop ${open ? 'is-open' : ''}`}
        aria-hidden={!open}
        onClick={onToggle}
      />

      <aside id="app-sidebar" className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Side navigation">
        <div className="sidebar__header">
          <h3 className="sidebar__title">Menu</h3>
        </div>

        <nav className="sidebar__nav" role="navigation">
          {items.map((it) => (
            <div key={it.key}>
              {it.hasSubmenu ? (
                <>
                  <button
                    type="button"
                    className={`sidebar__item ${active === it.key || (it.submenu && it.submenu.some(sub => sub.key === active)) ? 'is-active' : ''}`}
                    onClick={() => {
                      if (it.key === 'performance') setPerformanceOpen(!performanceOpen);
                      if (it.key === 'attendance') setAttendanceOpen(!attendanceOpen);
                      if (it.key === 'reports') setReportsOpen(!reportsOpen);
                      if (it.key === 'invoice') setInvoiceOpen(!invoiceOpen);
                    }}
                  >
                    {it.label}
                    <span className="sidebar__item-arrow">
                      {(it.key === 'performance' ? performanceOpen : it.key === 'attendance' ? attendanceOpen : it.key === 'reports' ? reportsOpen : it.key === 'invoice' ? invoiceOpen : false) ? '▼' : '▶'}
                    </span>
                  </button>

                  {/* Submenu */}
                  { (it.key === 'performance' ? performanceOpen : it.key === 'attendance' ? attendanceOpen : it.key === 'reports' ? reportsOpen : it.key === 'invoice' ? invoiceOpen : false) && (
                    <div className="sidebar__submenu">
                      {it.submenu.map((subItem) => (
                        <Link
                          key={subItem.key}
                          to={subItem.path || '#'}
                          className={`sidebar__subitem ${active === subItem.key ? 'is-active' : ''}`}
                          onClick={() => onSelect(subItem.key)}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={it.path || '#'}
                  className={`sidebar__item ${active === it.key ? 'is-active' : ''}`}
                  onClick={() => onSelect(it.key)}
                >
                  {it.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
