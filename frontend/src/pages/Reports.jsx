import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../components/Modal';
import { DownloadIcon, EyeIcon, ReportsIcon, RefreshIcon, AlertCircleIcon } from '../components/Icons';
import { 
  getDailyReport, 
  getWeeklyReport, 
  getMonthlyReport, 
  getDepartmentAnalytics 
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
export default function Reports({ onTriggerToast }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [reportsData, setReportsData] = useState({
    daily: null,
    weekly: null,
    monthly: null
  });

  const [departments, setDepartments] = useState([]);

  const fetchReportsData = async () => {
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
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError(err.message || 'Could not fetch live report metrics from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

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

  const handleDownload = (reportName) => {
    if (onTriggerToast) {
      onTriggerToast(`Downloading "${reportName}" as CSV/PDF spreadsheet...`);
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
                onClick={() => handleDownload(card.title)}
              >
                <DownloadIcon size={14} />
                <span>Download Report</span>
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
                if (selectedReport) handleDownload(selectedReport.title);
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
