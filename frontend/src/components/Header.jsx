import React, { useState } from 'react';
import { SearchIcon, BellIcon, MenuIcon } from './Icons';

/**
 * Header Component
 * Top bar displaying current page breadcrumb, global search, notification dropdown, and admin profile avatar.
 */
export default function Header({ activePage, onToggleMobileMenu, globalSearch, setGlobalSearch, onQuickNavigate }) {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: "80 students haven't submitted AI Workshop poll.", time: "10m ago", unread: true },
    { id: 2, text: "LeetCode activity increased by 14% today.", time: "1h ago", unread: true },
    { id: 3, text: "Weekly attendance & streak report generated.", time: "3h ago", unread: false }
  ];

  const pageTitleMap = {
    dashboard: 'Dashboard',
    students: 'Students Directory',
    activity: 'Platform Activity',
    polls: 'Polls & Surveys',
    reports: 'Accreditation Reports',
    analytics: 'Analytics & Trends',
    settings: 'System Status'
  };
  const pageTitle = pageTitleMap[activePage] || (activePage.charAt(0).toUpperCase() + activePage.slice(1));

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
          <span className="breadcrumb-root">Portal</span>
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
          placeholder="Search students, polls, platforms..."
          value={globalSearch || ''}
          onChange={(e) => setGlobalSearch && setGlobalSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onQuickNavigate) {
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
            <span className="notification-badge">2</span>
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>System Notifications</h4>
                <span className="notification-count">2 New</span>
              </div>
              <ul className="notification-list">
                {notifications.map((item) => (
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
                  Review Inactive Poll Students &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Avatar */}
        <div className="header-user">
          <div className="user-avatar-circle" title="Dr. Malavika - Admin">
            <span>M</span>
          </div>
          <div className="user-text">
            <span className="user-name">Dr. Malavika</span>
            <span className="user-subtext">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
