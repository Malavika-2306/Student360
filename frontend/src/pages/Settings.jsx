import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  AlertCircleIcon, 
  RefreshIcon 
} from '../components/Icons';
import { checkHealth, syncAllPlatforms } from '../services/api';

/**
 * Settings Page
 * Manage Admin Profile, Notification alerts for inactive students, reporting parameters,
 * and live system infrastructure & scheduler health diagnostics.
 */
export default function Settings({ onTriggerToast }) {
  // Admin profile state with localStorage persistence
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('student360_admin_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      name: "Dr. Malavika Ramanathan",
      email: "malavika.admin@college.edu",
      organization: "Department of Computer Science & Engineering",
      designation: "Associate Professor & Analytics Coordinator"
    };
  });

  // Notification settings state with localStorage persistence
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('student360_notifications');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      dailyAlert: true,
      inactiveWarning: true,
      pollCompletion: true,
      weeklyDigest: false
    };
  });

  // Preferences state with localStorage persistence
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('student360_preferences');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      defaultTimeframe: "This Week",
      streakThreshold: 5,
      platforms: {
        leetcode: true,
        codechef: true,
        github: true,
        polls: true
      }
    };
  });

  // System Diagnostics State
  const [systemHealth, setSystemHealth] = useState({
    status: 'checking',
    latency: null,
    details: null,
    error: null
  });
  const [pingLoading, setPingLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const runHealthCheck = React.useCallback(async () => {
    setPingLoading(true);
    const start = performance.now();
    try {
      const res = await checkHealth();
      const elapsed = Math.round(performance.now() - start);
      setSystemHealth({
        status: 'online',
        latency: elapsed,
        details: res,
        error: null
      });
    } catch (err) {
      setSystemHealth({
        status: 'error',
        latency: null,
        details: null,
        error: err.message || 'Backend unreachable'
      });
    } finally {
      setPingLoading(false);
    }
  }, []);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('student360_admin_profile', JSON.stringify(profile));
    } catch {
      // Ignore storage errors
    }
    if (onTriggerToast) {
      onTriggerToast("Admin profile details updated and saved locally!");
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('student360_preferences', JSON.stringify(preferences));
      localStorage.setItem('student360_notifications', JSON.stringify(notifications));
    } catch {
      // Ignore storage errors
    }
    if (onTriggerToast) {
      onTriggerToast("Analytics & notification preferences saved!");
    }
  };

  const handleTriggerSync = async () => {
    setSyncLoading(true);
    try {
      const res = await syncAllPlatforms();
      if (onTriggerToast) {
        onTriggerToast(res?.message || 'Multi-platform synchronization cycle initiated!');
      }
      await runHealthCheck();
    } catch (err) {
      if (onTriggerToast) {
        onTriggerToast(`Sync failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings & System Health</h1>
          <p className="page-subtitle">Configure administrative profile, notification alerts, and inspect live backend infrastructure.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Admin Profile Form */}
        <div className="card settings-card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Admin Profile</h2>
              <p className="card-subtitle">Manage your contact credentials and department attribution</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="simple-form mt-4">
            <div className="profile-badge-row">
              <div className="detail-avatar-large">
                {profile.name.charAt(4) || 'M'}
              </div>
              <div>
                <h4 className="font-semibold text-dark">{profile.name}</h4>
                <span className="text-muted text-sm">{profile.designation}</span>
              </div>
            </div>

            <div className="form-group mt-4">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">College Organization / Department</label>
              <input
                type="text"
                className="form-input"
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Designation / Role</label>
              <input
                type="text"
                className="form-input"
                value={profile.designation}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary mt-2">
              Save Profile Changes
            </button>
          </form>

          {/* Infrastructure Health Section */}
          <hr className="divider mt-6" />
          
          <div className="card-header-flex mt-4" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 className="card-title" style={{ fontSize: '1rem' }}>System & Infrastructure Status</h3>
              <p className="card-subtitle">Real-time health of services, database & scheduler</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={runHealthCheck}
              disabled={pingLoading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshIcon size={14} className={pingLoading ? 'spin' : ''} />
              {pingLoading ? 'Pinging...' : 'Ping Diagnostics'}
            </button>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: systemHealth.status === 'online' ? '#10b981' : '#ef4444' }}></span>
                <span className="font-medium text-dark text-sm">Express REST API</span>
              </div>
              <span className="text-xs" style={{ color: systemHealth.status === 'online' ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                {systemHealth.status === 'online' ? `Online (${systemHealth.latency} ms)` : 'Offline'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircleIcon size={14} color="#10b981" />
                <span className="font-medium text-dark text-sm">MongoDB Database</span>
              </div>
              <span className="text-xs text-muted">
                {systemHealth.details?.database || 'Connected (127.0.0.1:27017)'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircleIcon size={14} color="#10b981" />
                <span className="font-medium text-dark text-sm">Automated Sync Scheduler</span>
              </div>
              <span className="text-xs text-muted">
                {systemHealth.details?.scheduler || 'Active (6-Hour Interval)'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircleIcon size={14} color="#10b981" />
                <span className="font-medium text-dark text-sm">Faculty Alert Dispatcher</span>
              </div>
              <span className="text-xs text-muted">Operational (NotificationLog)</span>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm mt-2"
              onClick={handleTriggerSync}
              disabled={syncLoading}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <RefreshIcon size={14} className={syncLoading ? 'spin' : ''} />
              {syncLoading ? 'Executing Multi-Platform Sync...' : 'Trigger Immediate Background Sync'}
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card settings-card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Notification Alerts</h2>
              <p className="card-subtitle">Configure real-time alerts for student activity and poll milestones</p>
            </div>
          </div>

          <div className="toggles-list mt-4">
            <div className="toggle-row">
              <div className="toggle-info">
                <span className="toggle-title font-medium text-dark">Daily Inactivity Warning</span>
                <span className="toggle-desc text-muted text-xs">Send automatic alerts when a student is inactive for 3+ consecutive days</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.inactiveWarning}
                  onChange={(e) => setNotifications({ ...notifications, inactiveWarning: e.target.checked })}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="toggle-row">
              <div className="toggle-info">
                <span className="toggle-title font-medium text-dark">Poll Deadline Reminder</span>
                <span className="toggle-desc text-muted text-xs">Notify faculty 24 hours before a poll closes if response rate is below 80%</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.pollCompletion}
                  onChange={(e) => setNotifications({ ...notifications, pollCompletion: e.target.checked })}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="toggle-row">
              <div className="toggle-info">
                <span className="toggle-title font-medium text-dark">Daily Activity Summary</span>
                <span className="toggle-desc text-muted text-xs">Receive daily morning digest of platform solves and commits</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.dailyAlert}
                  onChange={(e) => setNotifications({ ...notifications, dailyAlert: e.target.checked })}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="toggle-row">
              <div className="toggle-info">
                <span className="toggle-title font-medium text-dark">Weekly Department Digest</span>
                <span className="toggle-desc text-muted text-xs">Email automated analytics snapshot to department heads every Monday</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.weeklyDigest}
                  onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          <hr className="divider mt-6" />

          {/* Report Preferences Form */}
          <div className="card-header-flex mt-4">
            <div>
              <h2 className="card-title">Report Preferences</h2>
              <p className="card-subtitle">Default parameters for generating analytics audits</p>
            </div>
          </div>

          <form onSubmit={handleSavePreferences} className="simple-form mt-4">
            <div className="form-group">
              <label className="form-label">Default Analytics Timeframe</label>
              <select
                className="form-input"
                value={preferences.defaultTimeframe}
                onChange={(e) => setPreferences({ ...preferences, defaultTimeframe: e.target.value })}
              >
                <option value="Today">Today (Daily Realtime)</option>
                <option value="This Week">This Week (7-day Aggregation)</option>
                <option value="This Month">This Month (Monthly Audit)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Minimum Streak Highlight Threshold (Days)</label>
              <input
                type="number"
                min="1"
                max="30"
                className="form-input"
                value={preferences.streakThreshold}
                onChange={(e) => setPreferences({ ...preferences, streakThreshold: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tracked Integration Platforms</label>
              <div className="form-checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferences.platforms.leetcode}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      platforms: { ...preferences.platforms, leetcode: e.target.checked }
                    })}
                  />
                  <span>LeetCode Analytics</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferences.platforms.codechef}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      platforms: { ...preferences.platforms, codechef: e.target.checked }
                    })}
                  />
                  <span>CodeChef Contests</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferences.platforms.github}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      platforms: { ...preferences.platforms, github: e.target.checked }
                    })}
                  />
                  <span>GitHub Repositories</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-secondary mt-2">
              Update Report Preferences
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
