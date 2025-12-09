import React, { useEffect, useRef, useState } from "react";
import "./Navbar.css";

export default function Navbar({
  logoSrc,
  logoAlt = "Logo",
  profileName = "",
  profileImageSrc,
  onProfileClick,
  onLogout, // Optional: when provided, a profile menu with Logout will be shown
  onMenuToggle, // Optional: when provided, show hamburger to toggle sidebar
  menuOpen = false,
  menuButtonAriaLabel,
  profileButtonAriaLabel = "Open profile menu",
}) {
  const initial = (profileName || "?").trim().charAt(0).toUpperCase();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  // Close menu on outside click or Escape
  useEffect(() => {
    if (!profileMenuOpen) return;
    const onDocClick = (e) => {
      const target = e.target;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        btnRef.current && !btnRef.current.contains(target)
      ) {
        setProfileMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileMenuOpen]);

  return (
    <header className="navbar" role="banner">
      <div className="navbar__left">
        {typeof onMenuToggle === 'function' && (
          <button
            type="button"
            className={`navbar__menuBtn ${menuOpen ? 'is-open' : ''}`}
            aria-label={menuButtonAriaLabel || (menuOpen ? 'Close side menu' : 'Open side menu')}
            aria-controls="app-sidebar"
            aria-expanded={menuOpen}
            onClick={onMenuToggle}
          >
            <span className="navbar__menuBar" />
            <span className="navbar__menuBar" />
            <span className="navbar__menuBar" />
          </button>
        )}
        {logoSrc ? (
          <img className="navbar__logo" src={logoSrc} alt={logoAlt} />
        ) : (
          <span className="navbar__brand" aria-label={logoAlt}>
            {logoAlt}
          </span>
        )}
      </div>

      <div className="navbar__right" aria-label="User section">
        {profileName && (
          <span className="navbar__name" title={profileName}>
            {profileName}
          </span>
        )}
        <button
          type="button"
          className="navbar__avatarButton"
          aria-label={profileButtonAriaLabel}
          ref={btnRef}
          aria-haspopup={!!onLogout}
          aria-expanded={profileMenuOpen}
          onClick={(e) => {
            if (typeof onProfileClick === "function") onProfileClick(e);
            if (onLogout) setProfileMenuOpen((v) => !v);
          }}
        >
          {profileImageSrc ? (
            <img className="navbar__avatar" src={profileImageSrc} alt="" />
          ) : (
            <span className="navbar__avatarFallback" aria-hidden="true">
              {initial}
            </span>
          )}
        </button>

        {onLogout && profileMenuOpen && (
          <div
            className="navbar__menu"
            role="menu"
            aria-label="Profile menu"
            ref={menuRef}
          >
            <button
              type="button"
              className="navbar__menuItem"
              role="menuitem"
              onClick={() => {
                setProfileMenuOpen(false);
                onLogout();
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
