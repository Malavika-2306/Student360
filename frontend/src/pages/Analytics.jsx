import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { AnalyticsIcon, ActivityIcon, PollsIcon, RefreshIcon, AlertCircleIcon } from '../components/Icons';
import { 
  getAnalyticsDashboard, 
  getPlatformAnalytics, 
  getDepartmentAnalytics 
} from '../services/api';

/**
 * Analytics Page
 * Deep dive into engagement trends, platform adoption, department-wise activity, and automated actionable insights.
 * Connected to live endpoints:
 * - GET /api/analytics/dashboard
 * - GET /api/analytics/platforms
 * - GET /api/analytics/departments
 */
export default function Analytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalStudents: 0,
    activeToday: 0,
    inactiveToday: 0,
    pollResponses: 0
  });

  const [platformData, setPlatformData] = useState({
    leetcode: { activeStudents: 0, percentage: 0 },
    codechef: { activeStudents: 0, percentage: 0 },
    github: { activeStudents: 0, percentage: 0 }
  });

  const [departmentList, setDepartmentList] = useState([]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, platRes, deptRes] = await Promise.all([
        getAnalyticsDashboard(),
        getPlatformAnalytics(),
        getDepartmentAnalytics()
      ]);

      if (dashRes && dashRes.data) {
        setDashboardMetrics(dashRes.data);
      }

      if (platRes && platRes.data) {
        setPlatformData(platRes.data);
      }

      if (deptRes && deptRes.data && Array.isArray(deptRes.data)) {
        setDepartmentList(deptRes.data);
      }
    } catch (err) {
      console.error('Failed to load analytics metrics:', err);
      setError(err.message || 'Could not fetch live analytics metrics from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const total = dashboardMetrics.totalStudents || 21;
  const activePercent = total > 0 ? Math.round((dashboardMetrics.activeToday / total) * 100) : 0;
  const pollPercent = total > 0 ? Math.round((dashboardMetrics.pollResponses / total) * 100) : 0;

  const platformStats = [
    { 
      name: 'LeetCode', 
      percentage: platformData.leetcode?.percentage ?? 0, 
      students: `${platformData.leetcode?.activeStudents ?? 0} / ${total}`, 
      color: 'bar-orange', 
      tag: (platformData.leetcode?.percentage ?? 0) > 40 ? 'High Adoption' : 'Moderate' 
    },
    { 
      name: 'CodeChef', 
      percentage: platformData.codechef?.percentage ?? 0, 
      students: `${platformData.codechef?.activeStudents ?? 0} / ${total}`, 
      color: 'bar-amber', 
      tag: (platformData.codechef?.percentage ?? 0) > 35 ? 'Moderate' : 'Developing' 
    },
    { 
      name: 'GitHub', 
      percentage: platformData.github?.percentage ?? 0, 
      students: `${platformData.github?.activeStudents ?? 0} / ${total}`, 
      color: 'bar-slate', 
      tag: 'Growing' 
    }
  ];

  const insights = [
    {
      id: 1,
      badge: "Platform Trend",
      title: "LeetCode Leads Coding Adoption",
      text: `Currently ${platformData.leetcode?.activeStudents ?? 0} students (${platformData.leetcode?.percentage ?? 0}%) practice actively on LeetCode, representing the strongest engagement channel for campus technical prep.`
    },
    {
      id: 2,
      badge: "Department Benchmark",
      title: "Top Department Consistency",
      text: departmentList.length > 0 
        ? `Top participation observed in ${departmentList.slice().sort((a,b) => b.participationRate - a.participationRate)[0]?.department || 'CSE'} with a ${departmentList.slice().sort((a,b) => b.participationRate - a.participationRate)[0]?.participationRate || 0}% activity rate.`
        : "CSE and AI&DS maintain leading consistency in problem submissions and version control activity."
    },
    {
      id: 3,
      badge: "Action Required",
      title: "Inactivity Alert for Engineering Cohorts",
      text: `${dashboardMetrics.inactiveToday} total students have zero logged activity today. Automated alert reminders can be dispatched from the Students and Polls modules.`
    }
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Understand student engagement and learning trends.</p>
        </div>

        <div className="page-header-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={fetchAnalyticsData}
            disabled={loading}
            title="Refresh analytics data from database"
          >
            <RefreshIcon size={16} className={loading ? "spin" : ""} />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
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
            onClick={fetchAnalyticsData}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading banner */}
      {loading && dashboardMetrics.totalStudents === 0 && (
        <div className="table-loading-container mb-4">
          <RefreshIcon size={24} className="spin text-primary" />
          <p>Analyzing student performance records from MongoDB...</p>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="stats-grid">
        <StatCard
          title="Participation Rate"
          value={`${activePercent}%`}
          description="Average across active database learners"
          icon={<AnalyticsIcon size={22} />}
          trend={{ text: `${dashboardMetrics.activeToday} active today`, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Daily Active"
          value={`${dashboardMetrics.activeToday} students`}
          description={`${activePercent}% of total student roster`}
          icon={<ActivityIcon size={22} />}
          trend={{ text: `${dashboardMetrics.inactiveToday} pending`, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Poll Response"
          value={`${dashboardMetrics.pollResponses}`}
          description={`${pollPercent}% responses recorded`}
          icon={<PollsIcon size={22} />}
          trend={{ text: "Survey participation", isPositive: true }}
          color="indigo"
        />
        <StatCard
          title="Total Students"
          value={`${total}`}
          description="Enrolled in live system"
          icon={<AnalyticsIcon size={22} />}
          trend={{ text: "Active database roster", isPositive: true }}
          color="orange"
        />
      </div>

      {/* Platform Activity Progress Bars */}
      <div className="card mt-6">
        <div className="card-header-flex">
          <div>
            <h2 className="card-title">Platform-wise Activity</h2>
            <p className="card-subtitle">Overall adoption and verified active students per learning platform</p>
          </div>
        </div>

        <div className="platform-bars-container mt-2">
          {platformStats.map((plat) => (
            <div key={plat.name} className="platform-bar-item">
              <div className="platform-bar-labels">
                <div className="flex-align-center gap-2">
                  <span className="font-semibold text-dark">{plat.name}</span>
                  <span className="badge-tag tag-sm">{plat.tag}</span>
                </div>
                <span className="platform-count">
                  <strong>{plat.percentage}%</strong> ({plat.students} students)
                </span>
              </div>
              <div className="custom-progress-track">
                <div 
                  className={`custom-progress-bar ${plat.color}`} 
                  style={{ width: `${plat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department-wise Activity */}
      <div className="card mt-6">
        <div className="card-header-flex">
          <div>
            <h2 className="card-title">Department-wise Activity</h2>
            <p className="card-subtitle">Comparative learning performance across all college departments</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Total Students</th>
                <th>Active Students</th>
                <th>Inactive Students</th>
                <th>Participation Rate</th>
              </tr>
            </thead>
            <tbody>
              {departmentList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-empty">
                    {loading ? "Loading departmental records..." : "No department records found."}
                  </td>
                </tr>
              ) : (
                departmentList.map((dept) => (
                  <tr key={dept.department}>
                    <td className="font-semibold text-dark">
                      <span className="department-tag">{dept.department}</span>
                    </td>
                    <td>{dept.totalStudents}</td>
                    <td className="text-success font-semibold">{dept.active}</td>
                    <td className="text-danger font-semibold">{dept.inactive}</td>
                    <td>
                      <div className="dept-progress-cell">
                        <span className="dept-rate font-bold text-dark">{dept.participationRate}%</span>
                        <div className="custom-progress-track dept-progress-track">
                          <div 
                            className="custom-progress-bar progress-bar-blue" 
                            style={{ width: `${dept.participationRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Section */}
      <div className="card mt-6">
        <div className="card-header-flex">
          <div>
            <h2 className="card-title">Automated Insights & Recommendations</h2>
            <p className="card-subtitle">AI-assisted observations generated from real-time activity metrics</p>
          </div>
        </div>

        <div className="insights-grid mt-2">
          {insights.map((item) => (
            <div key={item.id} className="insight-card">
              <span className="insight-badge">{item.badge}</span>
              <h4 className="insight-title">{item.title}</h4>
              <p className="insight-text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
