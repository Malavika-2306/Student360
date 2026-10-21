import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import ActivityTable from '../components/ActivityTable';
import { 
  StudentsIcon, 
  ActivityIcon, 
  PollsIcon, 
  AlertCircleIcon,
  RefreshIcon
} from '../components/Icons';
import { getDashboard, syncAllPlatforms } from '../services/api';

/**
 * Format timestamp into human-readable relative time
 */
function formatActivityTime(timeStr) {
  if (!timeStr) return 'Recently';
  try {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    const now = new Date();
    const diffMs = Math.max(0, now - date);
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  } catch {
    return timeStr;
  }
}

/**
 * Dashboard Page
 * Real-time student activity overview connected to GET /api/dashboard.
 */
export default function Dashboard({ students = [], polls = [], activities = [], onNavigate, onTriggerToast, user }) {
  const isStudent = user?.role === 'student';
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncingAll, setSyncingAll] = useState(false);

  const fetchDashboardData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboard();
      if (response && response.data) {
        setDashboardData(response.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError(err.message || 'Could not fetch dashboard data from server');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSyncAll = async () => {
    try {
      setSyncingAll(true);
      const res = await syncAllPlatforms();
      await fetchDashboardData();
      if (onTriggerToast) {
        onTriggerToast(res.message || 'Multi-platform synchronization finished!');
      }
    } catch (err) {
      console.error('Failed to sync all platforms:', err);
      if (onTriggerToast) {
        onTriggerToast(`Sync failed: ${err.message}`);
      }
    } finally {
      setSyncingAll(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Compute stats from live API with sensible defaults
  const totalStudents = dashboardData?.students?.total !== undefined
    ? dashboardData.students.total
    : (students.length > 0 ? students.length : 0);
  const activeToday = dashboardData?.students?.activeToday !== undefined
    ? dashboardData.students.activeToday
    : students.filter(s => s.activeToday).length;
  const inactiveToday = dashboardData?.students?.inactiveToday !== undefined
    ? dashboardData.students.inactiveToday
    : Math.max(0, totalStudents - activeToday);
  const pollResponses = dashboardData?.polls?.responses !== undefined
    ? dashboardData.polls.responses
    : (polls.length > 0 ? polls.reduce((acc, p) => acc + (p.responses?.length || 0), 0) : 0);
  const pollNotResponded = dashboardData?.polls?.notResponded !== undefined
    ? dashboardData.polls.notResponded
    : Math.max(0, totalStudents - pollResponses);
  
  // Percentages
  const activePercent = totalStudents > 0 ? Math.round((activeToday / totalStudents) * 100) : 0;
  const inactivePercent = totalStudents > 0 ? Math.round((inactiveToday / totalStudents) * 100) : 0;
  
  const turnoutPercent = dashboardData?.polls?.participation !== undefined
    ? Math.min(100, dashboardData.polls.participation)
    : (totalStudents > 0 ? Math.min(100, Math.round((pollResponses / totalStudents) * 100)) : 0);

  // Platform active counts from backend
  const leetcodeActive = dashboardData?.platformActivity?.leetcode ?? 0;
  const codechefActive = dashboardData?.platformActivity?.codechef ?? 0;
  const githubActive = dashboardData?.platformActivity?.github ?? 0;

  const platformData = [
    { 
      name: 'LeetCode', 
      tag: 'Algorithmic Problems',
      active: leetcodeActive, 
      total: totalStudents, 
      percentage: totalStudents > 0 ? Math.round((leetcodeActive / totalStudents) * 100) : 0, 
      color: 'bar-orange',
      badgeClass: 'tag-orange'
    },
    { 
      name: 'CodeChef', 
      tag: 'Contests & Rating',
      active: codechefActive, 
      total: totalStudents, 
      percentage: totalStudents > 0 ? Math.round((codechefActive / totalStudents) * 100) : 0, 
      color: 'bar-amber',
      badgeClass: 'tag-amber'
    },
    { 
      name: 'GitHub', 
      tag: 'Commits & Repositories',
      active: githubActive, 
      total: totalStudents, 
      percentage: totalStudents > 0 ? Math.round((githubActive / totalStudents) * 100) : 0, 
      color: 'bar-slate',
      badgeClass: 'tag-slate'
    }
  ];

  // Format recent activity list from backend
  const formattedActivities = (dashboardData?.recentActivity && dashboardData.recentActivity.length > 0)
    ? dashboardData.recentActivity.map(act => ({
        ...act,
        time: formatActivityTime(act.time),
        dataSource: act.dataSource || 'Sample'
      }))
    : activities.map(act => ({
        ...act,
        dataSource: act.dataSource || 'Sample'
      }));

  return (
    <div className="page-container">
      {/* Page Title & Subtitle */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{isStudent ? 'My Learning Overview' : 'Dashboard'}</h1>
          <p className="page-subtitle">
            {isStudent 
              ? `Welcome back, ${user?.name || 'Student'}! Here is your performance activity and campus metrics.`
              : "Welcome back! Here's today's student activity overview."
            }
          </p>
        </div>
        <div className="page-header-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={fetchDashboardData}
            disabled={loading}
            title="Refresh dashboard stats"
          >
            <RefreshIcon size={16} className={loading ? "spin" : ""} />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>

          {!isStudent && (
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={handleSyncAll}
              disabled={syncingAll}
              title="Synchronize connected GitHub, LeetCode, and CodeChef accounts across all students"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshIcon size={14} className={syncingAll ? 'spin' : ''} />
              <span>{syncingAll ? 'Syncing...' : 'Sync Platforms'}</span>
            </button>
          )}

          {!isStudent ? (
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => onNavigate('students')}
            >
              Manage Students
            </button>
          ) : (
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => onNavigate('activity')}
            >
              View My Activity
            </button>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {loading && !dashboardData && (
        <div className="table-loading-container mb-6">
          <RefreshIcon size={28} className="spin text-primary" />
          <p>Loading real-time student statistics from database...</p>
        </div>
      )}

      {/* Error alert banner */}
      {error && (
        <div className="alert-banner alert-banner-danger">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircleIcon size={18} />
            <span><strong>Server Connection Error:</strong> {error}</span>
          </div>
          <button 
            type="button" 
            className="btn btn-sm btn-outline-danger"
            onClick={fetchDashboardData}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Students"
          value={totalStudents}
          description="Enrolled across academic departments"
          icon={<StudentsIcon size={22} />}
          trend={{ text: "Active Database Roster", isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Active Today"
          value={activeToday}
          description={`${activePercent}% of total students active today`}
          icon={<ActivityIcon size={22} />}
          trend={{ text: `${activePercent}% active rate`, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Inactive Today"
          value={inactiveToday}
          description="Requires faculty reminder alert"
          icon={<AlertCircleIcon size={22} />}
          trend={{ text: `${inactivePercent}% inactive`, isPositive: false }}
          color="red"
        />
        <StatCard
          title="Poll Responses"
          value={pollResponses}
          description={`${turnoutPercent}% turnout on surveys`}
          icon={<PollsIcon size={22} />}
          trend={{ text: `${pollResponses} responses recorded`, isPositive: true }}
          color="indigo"
        />
      </div>

      {/* Main Grid: Platform Activity + Poll Participation Donut */}
      <div className="dashboard-two-column-grid">
        {/* Today's Platform Activity */}
        <div className="card dashboard-card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Today's Platform Activity</h2>
              <p className="card-subtitle">Active learners across coding & version control platforms</p>
            </div>
            <button 
              type="button" 
              className="btn-text" 
              onClick={() => onNavigate('activity')}
            >
              View Detailed &rarr;
            </button>
          </div>

          <div className="platform-bars-container">
            {platformData.map((plat) => (
              <div key={plat.name} className="platform-bar-item">
                <div className="platform-bar-labels">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="platform-name font-semibold text-dark">{plat.name}</span>
                    <span className={`badge-tag ${plat.badgeClass}`} style={{ fontSize: '0.6875rem' }}>{plat.tag}</span>
                  </div>
                  <span className="platform-count">
                    <strong>{plat.active}</strong> of {totalStudents} ({plat.percentage}%)
                  </span>
                </div>
                <div className="custom-progress-track">
                  <div 
                    className={`custom-progress-bar ${plat.color}`} 
                    style={{ width: `${Math.min(100, (plat.active / Math.max(totalStudents, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="platform-footer-note" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="info-icon">ℹ</span>
              <span>Multi-platform tracking</span>
              <span className="badge-source-real" style={{ fontSize: '0.7rem' }}>
                {dashboardData?.verifiedIntegrations?.github ?? 0} Real GitHub Verified
              </span>
            </div>
            <button 
              type="button" 
              className="btn-text text-xs" 
              onClick={() => onNavigate(isStudent ? 'activity' : 'students')}
              style={{ padding: 0 }}
            >
              Sync Accounts &rarr;
            </button>
          </div>
        </div>

        {/* Poll Participation */}
        <div className="card dashboard-card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Poll Participation</h2>
              <p className="card-subtitle">AI Workshop Interest Survey</p>
            </div>
            <button 
              type="button" 
              className="btn-text" 
              onClick={() => onNavigate('polls')}
            >
              View Polls &rarr;
            </button>
          </div>

          <div className="poll-visual-flex">
            {/* CSS Conic Gradient Donut Visual */}
            <div className="donut-chart-container">
              <div 
                className="css-donut" 
                style={{ 
                  background: `conic-gradient(#2563eb 0% ${turnoutPercent}%, #e2e8f0 ${turnoutPercent}% 100%)` 
                }}
              >
                <div className="donut-hole">
                  <span className="donut-percentage">{turnoutPercent}%</span>
                  <span className="donut-label">Turnout</span>
                </div>
              </div>
            </div>

            {/* Legend & Stats */}
            <div className="poll-legend-stats">
              <div className="legend-item">
                <span className="legend-dot dot-responded"></span>
                <div className="legend-text">
                  <span className="legend-title">Responded</span>
                  <span className="legend-value font-bold text-success">
                    {pollResponses} Responses ({turnoutPercent}%)
                  </span>
                </div>
              </div>

              <div className="legend-item">
                <span className="legend-dot dot-not-responded"></span>
                <div className="legend-text">
                  <span className="legend-title">Pending</span>
                  <span className="legend-value font-bold text-danger">
                    {pollNotResponded} Students ({Math.max(0, 100 - turnoutPercent)}%)
                  </span>
                </div>
              </div>

              <div className="poll-quick-action">
                <button 
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => onNavigate('polls')}
                >
                  Review Survey Details &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Student Activity */}
      <div className="card mt-6">
        <div className="card-header-flex">
          <div>
            <h2 className="card-title">Recent Student Activity</h2>
            <p className="card-subtitle">Real-time learning events and platform actions</p>
          </div>
          <button 
            type="button" 
            className="btn-text" 
            onClick={() => onNavigate('activity')}
          >
            All Activity Log &rarr;
          </button>
        </div>

        <ActivityTable activities={formattedActivities} limit={5} />
      </div>
    </div>
  );
}
