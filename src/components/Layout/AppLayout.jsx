import React, { useState, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import "./AppLayout.css";
import { useAuth } from "../../context/AuthContext";

// Main layout container for authenticated users
// Provides top navigation (Navbar) and side navigation (Sidebar)
// Displays page content via Outlet (child routes)
export default function AppLayout() {
  const { user, setUser } = useAuth() || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Map URL paths to sidebar menu keys for highlighting active menu item
  const getActiveKey = (pathname) => {
    if (pathname.startsWith("/attendance/mark")) return "attendance-mark";
    if (pathname.startsWith("/attendance/view-edit")) return "attendance-view-edit";
    if (pathname.startsWith("/attendance/summary")) return "attendance-summary";
    if (pathname.startsWith("/reports/physical-assessment")) return "reports-physical-assessment";
    if (pathname.startsWith("/invoice-template")) return "invoice-template";
    if (pathname.startsWith("/invoice")) return "invoice-standard";
    return "";
  };

  const [activeKey, setActiveKey] = useState(getActiveKey(location.pathname));

  // Update active menu item when URL changes
  React.useEffect(() => {
    setActiveKey(getActiveKey(location.pathname));
  }, [location.pathname]);

  // Handle sidebar menu navigation
  const handleSelect = useCallback(
    (key) => {
      setActiveKey(key);
      switch (key) {
        case "attendance-mark":
          navigate("/attendance/mark");
          break;
        case "attendance-view-edit":
          navigate("/attendance/view-edit");
          break;
        case "attendance-summary":
          navigate("/attendance/summary");
          break;
        case "reports-physical-assessment":
          navigate("/reports/physical-assessment");
          break;
        case "invoice-standard":
          navigate("/invoice");
          break;
        case "invoice-template":
          navigate("/invoice-template");
          break;
        default:
          break;
      }
    },
    [navigate]
  );

  const handleLogout = () => {
    try {
      localStorage.removeItem("auth");
      if (typeof setUser === "function") setUser(null);
    } catch (e) {
      // ignore
    }
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">
      <Navbar
        logoAlt="BAFL"
        profileName={user?.name || user?.username || ""}
        onMenuToggle={() => setMenuOpen((v) => !v)}
        menuOpen={menuOpen}
        onLogout={handleLogout}
      />

      <div className={`app-layout__body ${menuOpen ? "sidebar-open" : ""}`}>
        <Sidebar
          open={menuOpen}
          active={activeKey}
          onToggle={() => setMenuOpen((v) => !v)}
          onSelect={handleSelect}
        />

        <main className="app-layout__main" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
