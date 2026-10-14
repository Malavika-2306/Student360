import React, { useState } from 'react';

/**
 * Settings Page
 * Manage Admin Profile, Notification alerts for inactive students, and reporting parameters.
 */
export default function Settings({ onTriggerToast }) {
  const [profile, setProfile] = useState({
    name: "Dr. Malavika Ramanathan",
    email: "malavika.admin@college.edu",
    organization: "Department of Computer Science & Engineering",
    designation: "Associate Professor & Analytics Coordinator"
  });

  const [notifications, setNotifications] = useState({
    dailyAlert: true,
    inactiveWarning: true,
    pollCompletion: true,
    weeklyDigest: false
  });

  const [preferences, setPreferences] = useState({
    defaultTimeframe: "This Week",
    streakThreshold: 5,
    platforms: {
      leetcode: true,
      codechef: true,
      github: true,
      polls: true
    }
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (onTriggerToast) {
      onTriggerToast("Admin profile details updated successfully!");
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    if (onTriggerToast) {
      onTriggerToast("Analytics & notification preferences saved!");
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure administrative profile, notification alerts, and report parameters.</p>
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
