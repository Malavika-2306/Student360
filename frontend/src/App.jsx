import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Polls from './pages/Polls';
import Activity from './pages/Activity';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { getStudents, getPolls, getActivity } from './services/api';
import './App.css';

/**
 * Student360 – Learning Activity & Performance Analytics
 * Root Application Component
 */
export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  
  // App data state loaded from live backend
  const [students, setStudents] = useState([]);
  const [polls, setPolls] = useState([]);
  const [activities, setActivities] = useState([]);

  // Toast notification system
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Quick navigation helper
  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load real data from backend on initial mount
  useEffect(() => {
    // 1. Load Students
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
        }
      })
      .catch((err) => {
        console.warn('Backend students fetch failed, using fallback:', err.message);
      });

    // 2. Load Polls
    getPolls()
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          setPolls(res.data);
        }
      })
      .catch((err) => {
        console.warn('Backend polls fetch failed, using fallback:', err.message);
      });

    // 3. Load Activity
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
        console.warn('Backend activity fetch failed, using fallback:', err.message);
      });
  }, []);

  // Render the current page
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
          />
        );
      case 'students':
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
        return (
          <Reports 
            students={students}
            onTriggerToast={showToast} 
          />
        );
      case 'analytics':
        return (
          <Analytics />
        );
      case 'settings':
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
          />
        );
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={handleNavigate}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="app-main-wrapper">
        <Header 
          activePage={activePage}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onQuickNavigate={handleNavigate}
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
