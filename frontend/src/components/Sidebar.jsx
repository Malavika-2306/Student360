import React from 'react';
import {
  DashboardIcon,
  StudentsIcon,
  PollsIcon,
  ActivityIcon,
  ReportsIcon,
  AnalyticsIcon,
  SettingsIcon
} from './Icons';

/**
 * Sidebar Component
 * Left dark navy navigation with logo, navigation links, and admin profile card.
 */
export default function Sidebar({ activePage, setActivePage, isMobileOpen, setIsMobileOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'students', label: 'Students', icon: <StudentsIcon /> },
    { id: 'polls', label: 'Polls', icon: <PollsIcon /> },
    { id: 'activity', label: 'Activity', icon: <ActivityIcon /> },
    { id: 'reports', label: 'Reports', icon: <ReportsIcon /> },
    { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    if (setIsMobileOpen) {
      setIsMobileOpen(false); // Close drawer on mobile after clicking
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="sidebar-mobile-overlay" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'sidebar-open' : ''}`}>
        {/* Logo and Brand */}
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <span className="logo-symbol">360°</span>
          </div>
          <div className="brand-text-container">
            <h2 className="brand-title">Student360</h2>
            <span className="brand-subtitle">Learning Analytics</span>
          </div>

          {/* Close button for mobile */}
          <button 
            type="button" 
            className="sidebar-close-btn"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
          >
            &times;
          </button>
        </div>

        {/* Navigation items */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">MAIN MENU</div>
          <ul className="nav-list">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <li key={item.id} className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.label}</span>
                    {isActive && <span className="nav-indicator"></span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Admin Profile */}
        <div className="sidebar-footer">
          <div className="admin-profile-card">
            <div className="admin-avatar">
              <span>M</span>
              <span className="admin-status-dot" title="Online"></span>
            </div>
            <div className="admin-info">
              <span className="admin-name">Dr. Malavika</span>
              <span className="admin-role">Admin (CSE Dept)</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
