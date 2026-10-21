import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Polls from './pages/Polls';
import Activity from './pages/Activity';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { getStudents, getPolls, getActivity, getMe, logout } from './services/api';
import './App.css';

/**
 * Student360 – Learning Activity & Performance Analytics
 * Root Application Component with Secure Authentication & Role-Based Access Control
 */
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  
  // App data state loaded from live backend
  const [students, setStudents] = useState([]);
  const [polls, setPolls] = useState([]);
  const [activities, setActivities] = useState([]);

  // Toast notification system
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3800);
  }, []);

  const handleLogoutClean = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('student360_token');
      localStorage.removeItem('student360_user');
    }
    setUser(null);
    setActivePage('dashboard');
    setStudents([]);
    setPolls([]);
    setActivities([]);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore logout API failures
    }
    handleLogoutClean();
    showToast('You have been signed out.');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setActivePage('dashboard');
    showToast(`Signed in successfully as ${userData.name}`);
  };

  // Safe navigation with client-side role guard
  const handleNavigate = (pageId) => {
    if (user?.role === 'student' && ['students', 'reports', 'analytics', 'settings'].includes(pageId)) {
      showToast('Access restricted: This section requires faculty administrative privileges.');
      setActivePage('dashboard');
      return;
    }
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Session Restoration on initial mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('student360_token') : null;
    if (token) {
      getMe()
        .then((res) => {
          if (res && res.user) {
            setUser(res.user);
            localStorage.setItem('student360_user', JSON.stringify(res.user));
          } else {
            handleLogoutClean();
          }
        })
        .catch(() => {
          handleLogoutClean();
        })
        .finally(() => {
          setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
    }

    const handleExpired = () => {
      handleLogoutClean();
      showToast('Your session has expired. Please sign in again.');
    };

    window.addEventListener('auth:session_expired', handleExpired);
    return () => window.removeEventListener('auth:session_expired', handleExpired);
  }, [handleLogoutClean, showToast]);

  // 2. Load Real App Data whenever authenticated user changes
  useEffect(() => {
    if (!user) return;

    // Check for OAuth redirect query parameters
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('github_connected') === 'true') {
        showToast('GitHub account connected successfully via OAuth!');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (urlParams.get('oauth_error')) {
        showToast(`GitHub OAuth authorization failed: ${urlParams.get('oauth_error')}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {
      // Ignore URL parsing errors
    }

    // Load Students (scoped to student's own record if role === 'student')
    getStudents()
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          const normalized = res.data.map((s, idx) => {
            const id = s._id || s.id;
            const roll = s.rollNo || (s.email ? s.email.split('@')[0].toUpperCase() : `STU-${(id || '').slice(-4).toUpperCase()}`);
            return {
              ...s,
              id,
              _id: id,
              email: s.email || '',
              year: s.year || 3,
              rollNo: roll,
              leetcode: s.platforms ? !!s.platforms.leetcode : !!s.leetcode,
              codechef: s.platforms ? !!s.platforms.codechef : !!s.codechef,
              github: s.platforms ? !!s.platforms.github : !!s.github,
              activeToday: s.activeToday !== undefined ? !!s.activeToday : false,
              streak: s.streak !== undefined ? s.streak : (s.activeToday ? (idx % 15) + 3 : 0),
              lastActive: s.lastActive || (s.activeToday ? 'Today' : '3 days ago')
            };
          });
          setStudents(normalized);
        } else {
          setStudents([]);
        }
      })
      .catch((err) => {
        console.warn('Backend students fetch failed:', err.message);
      });

    // Load Polls
    getPolls()
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          setPolls(res.data);
        }
      })
      .catch((err) => {
        console.warn('Backend polls fetch failed:', err.message);
      });

    // Load Activity
    getActivity()
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          const mapped = res.data.map((act) => ({
            id: act._id || act.id,
            student: act.studentId?.name || 'Student',
            department: act.studentId?.department || 'CSE',
            platform: act.platform,
            activity: act.description || `${act.activityType} (${act.activityCount})`,
            time: act.activityDate ? new Date(act.activityDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'
          }));
          setActivities(mapped);
        }
      })
      .catch((err) => {
        console.warn('Backend activity fetch failed:', err.message);
      });
  }, [user, showToast]);

  // Loading Screen while restoring JWT session
  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="login-logo-badge">
          <span className="login-logo-symbol">360°</span>
        </div>
        <div className="login-spinner" style={{ width: '28px', height: '28px', borderTopColor: '#2563EB', borderColor: '#BFDBFE' }}></div>
        <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#475569' }}>Validating secure session...</p>
      </div>
    );
  }

  // If unauthenticated, display Login Portal
  if (!user) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        {toast && (
          <div className="toast-notification">
            <span className="toast-dot"></span>
            <span className="toast-message">{toast}</span>
            <button 
              type="button" 
              className="toast-close-btn"
              onClick={() => setToast(null)}
            >
              &times;
            </button>
          </div>
        )}
      </>
    );
  }

  // Render the current authenticated page
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard 
            students={students} 
            polls={polls} 
            activities={activities} 
            onNavigate={handleNavigate}
            onTriggerToast={showToast}
            user={user}
          />
        );
      case 'students':
        if (user.role === 'student') {
          return (
            <Dashboard 
              students={students} 
              polls={polls} 
              activities={activities} 
              onNavigate={handleNavigate}
              onTriggerToast={showToast}
              user={user}
            />
          );
        }
        return (
          <Students 
            students={students} 
            setStudents={setStudents} 
            initialSearch={globalSearch}
            onTriggerToast={showToast}
          />
        );
      case 'polls':
        return (
          <Polls 
            polls={polls} 
            setPolls={setPolls} 
            students={students} 
            onTriggerToast={showToast}
          />
        );
      case 'activity':
        return (
          <Activity 
            activities={activities} 
            onTriggerToast={showToast}
          />
        );
      case 'reports':
        if (user.role === 'student') {
          return (
            <Dashboard 
              students={students} 
              polls={polls} 
              activities={activities} 
              onNavigate={handleNavigate}
              onTriggerToast={showToast}
              user={user}
            />
          );
        }
        return (
          <Reports 
            students={students}
            onTriggerToast={showToast} 
          />
        );
      case 'analytics':
        if (user.role === 'student') {
          return (
            <Dashboard 
              students={students} 
              polls={polls} 
              activities={activities} 
              onNavigate={handleNavigate}
              onTriggerToast={showToast}
              user={user}
            />
          );
        }
        return (
          <Analytics />
        );
      case 'settings':
        if (user.role === 'student') {
          return (
            <Dashboard 
              students={students} 
              polls={polls} 
              activities={activities} 
              onNavigate={handleNavigate}
              onTriggerToast={showToast}
              user={user}
            />
          );
        }
        return (
          <Settings 
            onTriggerToast={showToast} 
          />
        );
      default:
        return (
          <Dashboard 
            students={students} 
            polls={polls} 
            activities={activities} 
            onNavigate={handleNavigate}
            onTriggerToast={showToast}
            user={user}
          />
        );
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar with role-based navigation and signout */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={handleNavigate}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="app-main-wrapper">
        <Header 
          activePage={activePage}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onQuickNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
        />

        <main className="app-main-content">
          {renderPage()}
        </main>
      </div>

      {/* Interactive Toast Notification */}
      {toast && (
        <div className="toast-notification">
          <span className="toast-dot"></span>
          <span className="toast-message">{toast}</span>
          <button 
            type="button" 
            className="toast-close-btn"
            onClick={() => setToast(null)}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
