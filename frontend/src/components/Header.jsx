import React, { useState } from 'react';
import { SearchIcon, BellIcon, MenuIcon } from './Icons';

/**
 * Header Component
 * Top bar displaying current page breadcrumb, global search, notification dropdown, user profile, and logout button.
 */
export default function Header({ 
  activePage, 
  onToggleMobileMenu, 
  globalSearch, 
  setGlobalSearch, 
  onQuickNavigate, 
  user, 
  onLogout 
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const isStudent = user?.role === 'student';

  const notifications = [
    { id: 1, text: "80 students haven't submitted AI Workshop poll.", time: "10m ago", unread: true },
    { id: 2, text: "LeetCode activity increased by 14% today.", time: "1h ago", unread: true },
    { id: 3, text: "Weekly attendance & streak report generated.", time: "3h ago", unread: false }
  ];

  const pageTitleMap = {
    dashboard: isStudent ? 'My Overview' : 'Dashboard',
    students: 'Students Directory',
    activity: 'Platform Activity',
    polls: 'Polls & Surveys',
    reports: 'Accreditation Reports',
    analytics: 'Analytics & Trends',
    settings: 'System Status'
  };
  const pageTitle = pageTitleMap[activePage] || (activePage.charAt(0).toUpperCase() + activePage.slice(1));
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : (isStudent ? 'S' : 'A');

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Mobile menu hamburger */}
        <button 
          type="button" 
          className="mobile-menu-btn" 
          onClick={onToggleMobileMenu}
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span className="breadcrumb-root">{isStudent ? 'Student Space' : 'Portal'}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{pageTitle}</span>
        </div>
      </div>

      {/* Center Search */}
      <div className="header-search">
        <span className="search-icon-wrapper">
          <SearchIcon />
        </span>
        <input 
          type="text"
          className="header-search-input"
          placeholder={isStudent ? "Search my activities, polls..." : "Search students, polls, platforms..."}
          value={globalSearch || ''}
          onChange={(e) => setGlobalSearch && setGlobalSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onQuickNavigate && !isStudent) {
              onQuickNavigate('students');
            }
          }}
        />
        {globalSearch && (
          <button 
            type="button" 
            className="search-clear-btn"
            onClick={() => setGlobalSearch('')}
          >
            &times;
          </button>
        )}
      </div>

      {/* Header Right Actions */}
      <div className="header-right">
        {/* Semester / Academic Session Tag */}
        <div className="session-badge" title="Active Academic Term">
          <span className="session-dot"></span>
          <span>Odd Sem 2026-27</span>
        </div>

        {/* Notifications Icon & Popover */}
        <div className="notification-wrapper">
          <button 
            type="button" 
            className="icon-button notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            title="Notifications"
          >
            <BellIcon />
            <span className="notification-badge">{isStudent ? '1' : '2'}</span>
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>System Notifications</h4>
                <span className="notification-count">{isStudent ? '1 New' : '2 New'}</span>
              </div>
              <ul className="notification-list">
                {notifications.slice(0, isStudent ? 1 : 3).map((item) => (
                  <li key={item.id} className={`notification-item ${item.unread ? 'unread' : ''}`}>
                    <p className="notification-text">{item.text}</p>
                    <span className="notification-time">{item.time}</span>
                  </li>
                ))}
              </ul>
              <div className="notification-footer">
                <button 
                  type="button" 
                  className="notification-view-all"
                  onClick={() => {
                    setShowNotifications(false);
                    if (onQuickNavigate) onQuickNavigate('polls');
                  }}
                >
                  Review Active Polls &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Chip */}
        <div className="header-user" title={`Logged in as ${user?.name || 'User'} (${user?.email || ''})`}>
          <div className="user-avatar-circle">
            <span>{userInitial}</span>
          </div>
          <div className="user-text">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-subtext">{isStudent ? 'Student' : 'Admin'}</span>
          </div>
        </div>

        {/* Header Logout Button */}
        {onLogout && (
          <button
            type="button"
            className="header-logout-btn"
            onClick={onLogout}
            title="Log out of session"
            aria-label="Log out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="logout-text">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}
