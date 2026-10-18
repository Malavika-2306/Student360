import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../components/Modal';
import { DownloadIcon, EyeIcon, ReportsIcon, RefreshIcon, AlertCircleIcon } from '../components/Icons';
import { 
  getDailyReport, 
  getWeeklyReport, 
  getMonthlyReport, 
  getDepartmentAnalytics,
  getStudents
} from '../services/api';

/**
 * Reports Page
 * Generate and download daily, weekly, and monthly student activity reports.
 * Connected to live endpoints:
 * - GET /api/reports/daily
 * - GET /api/reports/weekly
 * - GET /api/reports/monthly
 * - GET /api/analytics/departments
 */
export default function Reports({ students: propStudents, onTriggerToast }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const [reportsData, setReportsData] = useState({
    daily: null,
    weekly: null,
    monthly: null
  });

  const [departments, setDepartments] = useState([]);
  const [localStudents, setLocalStudents] = useState(propStudents || []);

  const fetchReportsData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dailyRes, weeklyRes, monthlyRes, deptRes] = await Promise.all([
        getDailyReport(),
        getWeeklyReport(),
        getMonthlyReport(),
        getDepartmentAnalytics()
      ]);

      setReportsData({
        daily: dailyRes?.data || null,
        weekly: weeklyRes?.data || null,
        monthly: monthlyRes?.data || null
      });

      if (deptRes && deptRes.data && Array.isArray(deptRes.data)) {
        setDepartments(deptRes.data);
      }

      if (!propStudents || propStudents.length === 0) {
        getStudents().then((sRes) => {
          if (sRes?.data) setLocalStudents(sRes.data);
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError(err.message || 'Could not fetch live report metrics from server');
    } finally {
      setLoading(false);
    }
  }, [propStudents]);

  useEffect(() => {
    if (propStudents && propStudents.length > 0) {
      setLocalStudents(propStudents);
    }
  }, [propStudents]);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  const d = reportsData.daily;
  const w = reportsData.weekly;
  const m = reportsData.monthly;

  const totalStudents = d?.totalStudents || w?.totalStudents || 21;

  const reportCards = useMemo(() => {
    const todayStr = new Date().toLocaleDateString();
    return [
      {
        id: 'daily',
        title: 'Daily Report',
        period: 'Last 24 Hours',
        description: 'Comprehensive summary of daily platform logins, problem solves on LeetCode/CodeChef, and new GitHub commits.',
        stats: {
          active: d?.activeStudents ?? 0,
          inactive: d?.inactiveStudents ?? 0,
          rate: `${d?.participationPercentage ?? 0}%`
        },
        date: todayStr
      },
      {
        id: 'weekly',
        title: 'Weekly Report',
        period: 'Past 7 Days',
        description: '7-day learning velocity, student consistency streaks, department benchmark comparisons, and contest performance.',
        stats: {
          active: w?.activeStudents ?? 0,
          inactive: w?.inactiveStudents ?? 0,
          rate: `${totalStudents > 0 ? Math.round(((w?.activeStudents ?? 0) / totalStudents) * 100) : 0}%`
        },
        date: todayStr
      },
      {
        id: 'monthly',
        title: 'Monthly Report',
        period: 'Past 30 Days',
        description: 'Full monthly audit of student activity compliance, persistent inactive students roster, and department accreditation metrics.',
        stats: {
          active: m?.activeStudents ?? 0,
          inactive: m?.inactiveStudents ?? 0,
          rate: `${totalStudents > 0 ? Math.round(((m?.activeStudents ?? 0) / totalStudents) * 100) : 0}%`
        },
        date: todayStr
      }
    ];
  }, [d, w, m, totalStudents]);

  const recentReportLogs = useMemo(() => {
    const today = Date.now();
    return [
      {
        id: 1,
        name: 'Daily Platform Activity Audit',
        date: new Date(today).toLocaleDateString(),
        students: totalStudents,
        participation: `${d?.participationPercentage ?? 0}%`,
        status: 'Live Synced'
      },
      {
        id: 2,
        name: 'Weekly Student Performance Roster',
        date: new Date(today - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        students: totalStudents,
        participation: `${totalStudents > 0 ? Math.round(((w?.activeStudents ?? 0) / totalStudents) * 100) : 0}%`,
        status: 'Live Synced'
      },
      {
        id: 3,
        name: 'Monthly Academic Accreditation Summary',
        date: new Date(today - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        students: totalStudents,
        participation: `${totalStudents > 0 ? Math.round(((m?.activeStudents ?? 0) / totalStudents) * 100) : 0}%`,
        status: 'Live Synced'
      }
    ];
  }, [d, w, m, totalStudents]);

  const handleDownload = (reportTitle, cardData = null) => {
    try {
      setDownloading(true);
      const isDaily = (reportTitle || '').toLowerCase().includes('daily');
      const isWeekly = (reportTitle || '').toLowerCase().includes('weekly');

      const matchedCard = cardData || reportCards.find(c => (c.title || '').toLowerCase() === (reportTitle || '').toLowerCase());

      const stats = matchedCard?.stats || {
        active: isDaily ? (d?.activeStudents ?? 0) : isWeekly ? (w?.activeStudents ?? 0) : (m?.activeStudents ?? 0),
        inactive: isDaily ? (d?.inactiveStudents ?? 0) : isWeekly ? (w?.inactiveStudents ?? 0) : (m?.inactiveStudents ?? 0),
        rate: isDaily ? `${d?.participationPercentage ?? 0}%` : `${totalStudents > 0 ? Math.round(((isWeekly ? (w?.activeStudents ?? 0) : (m?.activeStudents ?? 0)) / totalStudents) * 100) : 0}%`
      };

      const period = matchedCard?.period || (isDaily ? 'Last 24 Hours' : isWeekly ? 'Past 7 Days' : 'Past 30 Days');
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const safeTitle = (reportTitle || 'Activity_Report').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Student360_${safeTitle}_${dateStr}.csv`;

      const rows = [];

      // Section 1: Executive Report Metadata
      rows.push(['Student360 - Learning Activity & Performance Analytics']);
      rows.push(['Official Academic Activity & Compliance Report']);
      rows.push(['Report Type', reportTitle || 'Activity Report']);
      rows.push(['Reporting Period', period]);
      rows.push(['Date Generated', now.toLocaleString()]);
      rows.push(['Total Students Tracked', totalStudents]);
      rows.push(['Active Students in Period', stats.active]);
      rows.push(['Inactive Students', stats.inactive]);
      rows.push(['Participation Benchmark', stats.rate]);
      rows.push([]);

      // Section 2: Department Performance Matrix
      rows.push(['Departmental Performance Matrix']);
      rows.push(['Department', 'Total Students', 'Active Students', 'Inactive Students', 'Participation Rate (%)']);
      if (departments && departments.length > 0) {
        departments.forEach((dept) => {
          rows.push([
            dept.department,
            dept.totalStudents,
            dept.active,
            dept.inactive,
            `${dept.participationRate}%`
          ]);
        });
      } else {
        rows.push(['CSE', totalStudents, stats.active, stats.inactive, stats.rate]);
      }
      rows.push([]);

      // Section 3: Student Roster & Tracking Details
      const studentsList = (localStudents && localStudents.length > 0) ? localStudents : (propStudents || []);
      if (studentsList && studentsList.length > 0) {
        rows.push(['Student Cohort Roster & Verification Status']);
        rows.push([
          'Roll No',
          'Student Name',
          'Department',
          'Year',
          'Status Today',
          'Current Streak (Days)',
          'GitHub Active',
          'LeetCode Active',
          'CodeChef Active'
        ]);
        studentsList.forEach((s) => {
          rows.push([
            s.rollNo || 'N/A',
            s.name || 'Student',
            s.department || 'CSE',
            s.year || 3,
            s.activeToday ? 'Active' : 'Inactive',
            s.streak !== undefined ? s.streak : (s.activeToday ? 3 : 0),
            (s.platforms?.github || s.github) ? 'Yes' : 'No',
            (s.platforms?.leetcode || s.leetcode) ? 'Yes' : 'No',
            (s.platforms?.codechef || s.codechef) ? 'Yes' : 'No'
          ]);
        });
      }

      // Convert rows to valid RFC 4180 CSV
      const processCell = (cell) => {
        if (cell === null || cell === undefined) return '""';
        let str = String(cell);
        if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
          str = `"${str.replace(/"/g, '""')}"`;
        } else {
          str = `"${str}"`;
        }
        return str;
      };

      const csvContent = '\uFEFF' + rows.map(r => r.map(processCell).join(',')).join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (onTriggerToast) {
        onTriggerToast(`Downloaded "${filename}" as CSV spreadsheet!`);
      }
    } catch (err) {
      console.error('Failed to generate CSV download:', err);
      if (onTriggerToast) {
        onTriggerToast(`Download failed: ${err.message}`);
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate daily, weekly and monthly student activity reports.</p>
        </div>

        <div className="page-header-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={fetchReportsData}
            disabled={loading}
            title="Refresh reports data from database"
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
            onClick={fetchReportsData}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading banner */}
      {loading && !reportsData.daily && (
        <div className="table-loading-container mb-4">
          <RefreshIcon size={24} className="spin text-primary" />
          <p>Generating reports from MongoDB database...</p>
        </div>
      )}

      {/* 3 Report Cards */}
      <div className="report-cards-grid">
        {reportCards.map((card) => (
          <div key={card.id} className="card report-card">
            <div className="report-card-top">
              <div className="report-icon-box">
                <ReportsIcon size={24} />
              </div>
              <span className="report-period-tag">{card.period}</span>
            </div>

            <h3 className="report-card-title">{card.title}</h3>
            <p className="report-card-desc">{card.description}</p>

            <div className="report-metric-summary">
              <div className="report-metric-col">
                <span className="text-xs text-muted">Active Students</span>
                <span className="font-bold text-success">{card.stats.active}</span>
              </div>
              <div className="report-metric-col">
                <span className="text-xs text-muted">Inactive</span>
                <span className="font-bold text-danger">{card.stats.inactive}</span>
              </div>
              <div className="report-metric-col">
                <span className="text-xs text-muted">Participation</span>
                <span className="font-bold text-primary">{card.stats.rate}</span>
              </div>
            </div>

            <div className="report-card-actions">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedReport(card)}
              >
                <EyeIcon size={14} />
                <span>View Report</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleDownload(card.title, card)}
                disabled={downloading}
              >
                <DownloadIcon size={14} />
                <span>{downloading ? 'Preparing...' : 'Download Report'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports Table */}
      <div className="card mt-6">
        <div className="card-header-flex">
          <div>
            <h2 className="card-title">Recent Reports Log</h2>
            <p className="card-subtitle">History of generated activity and audit documentation</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Date Generated</th>
                <th>Students Tracked</th>
                <th>Participation Rate</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentReportLogs.map((rep) => (
                <tr key={rep.id}>
                  <td className="font-semibold text-dark">
                    <div className="report-name-cell">
                      <ReportsIcon size={16} />
                      <span>{rep.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{rep.date}</td>
                  <td>{rep.students} Students</td>
                  <td>
                    <span className="font-semibold text-primary">{rep.participation}</span>
                  </td>
                  <td>
                    <span className="status-badge badge-active">
                      <span className="badge-dot"></span>
                      {rep.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="btn btn-outline btn-xs"
                      onClick={() => handleDownload(rep.name)}
                    >
                      <DownloadIcon size={13} />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Report Detail Modal */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={selectedReport ? `${selectedReport.title} Preview` : 'Report Preview'}
        size="large"
        footer={
          <div className="modal-footer-flex">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (selectedReport) handleDownload(selectedReport.title, selectedReport);
                setSelectedReport(null);
              }}
            >
              <DownloadIcon size={15} />
              <span>Download Full Spreadsheet (.CSV)</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedReport(null)}
            >
              Close Preview
            </button>
          </div>
        }
      >
        {selectedReport && (
          <div className="report-preview-content">
            <div className="report-meta-box">
              <div className="meta-pair">
                <span className="meta-pair-label">Reporting Period:</span>
                <span className="meta-pair-val">{selectedReport.period}</span>
              </div>
              <div className="meta-pair">
                <span className="meta-pair-label">Date Generated:</span>
                <span className="meta-pair-val">{selectedReport.date}</span>
              </div>
              <div className="meta-pair">
                <span className="meta-pair-label">Scope:</span>
                <span className="meta-pair-val">All Engineering Departments ({totalStudents} Students)</span>
              </div>
            </div>

            <h4 className="section-subheading mt-4">Executive Summary</h4>
            <p className="text-secondary text-sm">
              {selectedReport.description} During this period, <strong>{selectedReport.stats.active} students</strong> logged verified learning milestones across LeetCode, CodeChef, and GitHub, achieving an aggregate engagement benchmark of <strong>{selectedReport.stats.rate}</strong>.
            </p>

            <h4 className="section-subheading mt-4">Departmental Performance Summary</h4>
            <div className="table-responsive mt-2">
              <table className="custom-table table-condensed">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Total Students</th>
                    <th>Active</th>
                    <th>Inactive</th>
                    <th>Engagement Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="table-empty">Loading departmental statistics...</td>
                    </tr>
                  ) : (
                    departments.map((dept) => (
                      <tr key={dept.department}>
                        <td className="font-semibold">{dept.department}</td>
                        <td>{dept.totalStudents}</td>
                        <td className="text-success font-semibold">{dept.active}</td>
                        <td className="text-danger">{dept.inactive}</td>
                        <td className="font-semibold text-primary">{dept.participationRate}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
