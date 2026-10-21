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
 * Left dark navy navigation with logo, role-filtered navigation links, user chip, and logout button.
 */
export default function Sidebar({ activePage, setActivePage, isMobileOpen, setIsMobileOpen, user, onLogout }) {
  const isStudent = user?.role === 'student';

  // Role-based navigation: students see only permitted features
  const allNavItems = [
    { id: 'dashboard', label: isStudent ? 'My Overview' : 'Dashboard', icon: <DashboardIcon />, roles: ['admin', 'student'] },
    { id: 'students', label: 'Students', icon: <StudentsIcon />, roles: ['admin'] },
    { id: 'activity', label: 'Platform Activity', icon: <ActivityIcon />, roles: ['admin', 'student'] },
    { id: 'polls', label: 'Polls & Surveys', icon: <PollsIcon />, roles: ['admin', 'student'] },
    { id: 'reports', label: 'Reports', icon: <ReportsIcon />, roles: ['admin'] },
    { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon />, roles: ['admin'] },
    { id: 'settings', label: 'System Status', icon: <SettingsIcon />, roles: ['admin'] },
  ];

  const navItems = allNavItems.filter((item) => item.roles.includes(user?.role || 'admin'));

  const handleNavClick = (id) => {
    setActivePage(id);
    if (setIsMobileOpen) {
      setIsMobileOpen(false); // Close drawer on mobile after clicking
    }
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : (isStudent ? 'S' : 'A');
  const roleLabel = isStudent ? 'Student (Enrolled)' : 'Administrator (Faculty)';

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
            <span className="brand-subtitle">{isStudent ? 'Student Portal' : 'Learning Analytics'}</span>
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
          <div className="nav-section-label">{isStudent ? 'STUDENT MENU' : 'MAIN MENU'}</div>
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

        {/* Bottom User Profile & Sign Out */}
        <div className="sidebar-footer">
          <div className="admin-profile-card">
            <div className="admin-avatar">
              <span>{initial}</span>
              <span className="admin-status-dot" title="Authenticated session active"></span>
            </div>
            <div className="admin-info">
              <span className="admin-name">{user?.name || 'Authorized User'}</span>
              <span className="admin-role">{roleLabel}</span>
            </div>
            {onLogout && (
              <button
                type="button"
                className="sidebar-logout-btn"
                onClick={onLogout}
                title="Sign out of Student360"
                aria-label="Sign out"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
