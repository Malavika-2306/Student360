import React, { useState, useEffect } from 'react';
import ActivityTable from '../components/ActivityTable';
import { RefreshIcon, AlertCircleIcon } from '../components/Icons';
import { 
  getActivity, 
  getActivitySummary, 
  getWeeklyAnalytics, 
  getAnalyticsDashboard 
} from '../services/api';

/**
 * Activity Page
 * Daily, weekly, and monthly activity across LeetCode, CodeChef, GitHub, and Polls.
 * Connected to live endpoints:
 * - GET /api/activity
 * - GET /api/activity/summary
 * - GET /api/analytics/weekly
 * - GET /api/analytics/dashboard
 */
export default function Activity({ activities: propActivities }) {
  const [timeframe, setTimeframe] = useState('This Week');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Live state
  const [activitiesList, setActivitiesList] = useState(propActivities || []);
  const [summaryData, setSummaryData] = useState({
    leetcode: 0,
    codechef: 0,
    github: 0,
    polls: 0
  });
  const [studentStats, setStudentStats] = useState({
    activeStudents: 0,
    inactiveStudents: 0,
    totalActivities: 0
  });
  const [weeklyTrend, setWeeklyTrend] = useState([
    { day: 'Mon', count: 0 },
    { day: 'Tue', count: 0 },
    { day: 'Wed', count: 0 },
    { day: 'Thu', count: 0 },
    { day: 'Fri', count: 0 },
    { day: 'Sat', count: 0 },
    { day: 'Sun', count: 0 }
  ]);

  const fetchActivityData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [actRes, summaryRes, trendRes, dashRes] = await Promise.all([
        getActivity(),
        getActivitySummary(),
        getWeeklyAnalytics(),
        getAnalyticsDashboard()
      ]);

      // 1. Process activity feed
      if (actRes && actRes.data) {
        const mapped = actRes.data.map((act) => ({
          id: act._id || act.id,
          _id: act._id || act.id,
          student: act.studentId?.name || 'Student',
          department: act.studentId?.department || 'CSE',
          platform: act.platform,
          activity: act.description || `${act.activityType} (${act.activityCount})`,
          time: act.activityDate ? new Date(act.activityDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
          dataSource: act.dataSource || 'Sample'
        }));
        setActivitiesList(mapped);
      }

      // 2. Process summary counts
      if (summaryRes && summaryRes.data) {
        setSummaryData(summaryRes.data);
      }

      // 3. Process weekly chart trend
      if (trendRes && trendRes.data && Array.isArray(trendRes.data)) {
        setWeeklyTrend(trendRes.data);
      }

      // 4. Process student totals
      if (dashRes && dashRes.data) {
        const totalActs = actRes?.count || actRes?.data?.length || 0;
        setStudentStats({
          activeStudents: dashRes.data.activeToday || 0,
          inactiveStudents: dashRes.data.inactiveToday || 0,
          totalActivities: totalActs
        });
      }
    } catch (err) {
      console.error('Failed to load activity metrics:', err);
      setError(err.message || 'Could not fetch live activity data from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityData();
  }, []);

  // Calculate highest count to scale bar chart heights accurately
  const maxCount = Math.max(...weeklyTrend.map((d) => d.count), 1);

  return (
    <div className="page-container">
      {/* Header and Date Filter */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Activity</h1>
          <p className="page-subtitle">Monitor student activity across learning platforms.</p>
        </div>

        <div className="page-header-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={fetchActivityData}
            disabled={loading}
            title="Refresh activity data from database"
          >
            <RefreshIcon size={16} className={loading ? "spin" : ""} />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>

          {/* Date Filter Tabs */}
          <div className="timeframe-toggle">
            {['Today', 'This Week', 'This Month'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`timeframe-btn ${timeframe === tab ? 'active' : ''}`}
                onClick={() => setTimeframe(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="alert-banner alert-banner-danger mt-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircleIcon size={18} />
            <span><strong>Connection Error:</strong> {error}</span>
          </div>
          <button 
            type="button" 
            className="btn btn-sm btn-outline-danger"
            onClick={fetchActivityData}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading banner */}
      {loading && (
        <div className="table-loading-container mb-4">
          <RefreshIcon size={24} className="spin text-primary" />
          <p>Syncing live activity events from MongoDB...</p>
        </div>
      )}

      {/* 4 Platform Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-orange">
          <div className="stat-card-header">
            <span className="stat-card-title">LeetCode</span>
            <span className="badge-tag tag-orange">Coding</span>
          </div>
          <div className="stat-card-body">
            <h3 className="stat-card-value">{summaryData.leetcode}</h3>
          </div>
          <p className="stat-card-desc">Active Students practicing algorithmic problems</p>
        </div>

        <div className="stat-card stat-card-amber">
          <div className="stat-card-header">
            <span className="stat-card-title">CodeChef</span>
            <span className="badge-tag tag-amber">Contests</span>
          </div>
          <div className="stat-card-body">
            <h3 className="stat-card-value">{summaryData.codechef}</h3>
          </div>
          <p className="stat-card-desc">Active Students participating in Starters contests</p>
        </div>

        <div className="stat-card stat-card-slate">
          <div className="stat-card-header">
            <span className="stat-card-title">GitHub</span>
            <span className="badge-tag tag-slate">Dev & Repos</span>
          </div>
          <div className="stat-card-body">
            <h3 className="stat-card-value">{summaryData.github}</h3>
          </div>
          <p className="stat-card-desc">Active Students pushing commits and pull requests</p>
        </div>

        <div className="stat-card stat-card-indigo">
          <div className="stat-card-header">
            <span className="stat-card-title">Polls</span>
            <span className="badge-tag tag-indigo">Surveys</span>
          </div>
          <div className="stat-card-body">
            <h3 className="stat-card-value">{summaryData.polls}</h3>
          </div>
          <p className="stat-card-desc">Student responses registered across college polls</p>
        </div>
      </div>

      {/* Summary counters: Active, Inactive, Total Activities */}
      <div className="activity-summary-banner mt-6">
        <div className="summary-banner-item">
          <span className="summary-banner-label">Active Students</span>
          <span className="summary-banner-value text-success font-bold">{studentStats.activeStudents}</span>
          <span className="summary-banner-subtext">Active during selected period</span>
        </div>

        <div className="summary-banner-divider"></div>

        <div className="summary-banner-item">
          <span className="summary-banner-label">Inactive Students</span>
          <span className="summary-banner-value text-danger font-bold">{studentStats.inactiveStudents}</span>
          <span className="summary-banner-subtext">Zero platform engagement</span>
        </div>

        <div className="summary-banner-divider"></div>

        <div className="summary-banner-item">
          <span className="summary-banner-label">Total Activities</span>
          <span className="summary-banner-value text-primary font-bold">{studentStats.totalActivities.toLocaleString()}</span>
          <span className="summary-banner-subtext">Problems, commits & submissions</span>
        </div>

        <div className="summary-banner-divider"></div>

        <div className="summary-banner-item">
          <span className="summary-banner-label">Data Authenticity</span>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span className="badge-source-real" style={{ fontSize: '0.75rem' }}>
              {summaryData.realCount || 0} Real
            </span>
            <span className="badge-source-sample" style={{ fontSize: '0.75rem' }}>
              {summaryData.sampleCount || 0} Sample
            </span>
          </div>
          <span className="summary-banner-subtext">Verified live events vs benchmarks</span>
        </div>
      </div>

      {/* Weekly Learning Activity Chart */}
      <div className="card mt-6">
        <div className="card-header-flex">
          <div>
            <h2 className="card-title">Learning Activity Trend ({timeframe})</h2>
            <p className="card-subtitle">Volume of coding submissions and platform interactions</p>
          </div>
          <span className="timeframe-indicator-tag">Filter: {timeframe}</span>
        </div>

        {/* Clean CSS Bar Chart */}
        <div className="css-bar-chart-wrapper">
          <div className="chart-bars-row">
            {weeklyTrend.map((item, index) => {
              const heightPercent = maxCount > 0 ? Math.round((item.count / maxCount) * 100) : 0;
              return (
                <div key={index} className="chart-column">
                  <div className="chart-bar-container">
                    <div className="chart-bar-tooltip">
                      <strong>{item.count}</strong> activities
                    </div>
                    <div 
                      className="chart-bar-fill" 
                      style={{ height: `${Math.max(heightPercent, 12)}%` }}
                    />
                  </div>
                  <span className="chart-bar-label font-medium">{item.day}</span>
                  <span className="chart-bar-sublabel text-xs text-muted">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Live Activity Log */}
      <div className="card mt-6">
        <div className="card-header-flex">
          <div>
            <h2 className="card-title">Live Platform Feed</h2>
            <p className="card-subtitle">Recent automated activity sync from LeetCode, CodeChef, and GitHub</p>
          </div>
        </div>
        <ActivityTable activities={activitiesList} />
      </div>
    </div>
  );
}
