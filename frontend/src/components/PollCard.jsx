import React from 'react';
import { AlertCircleIcon, CheckIcon } from './Icons';

/**
 * PollCard Component
 * Highlights the main unique feature:
 * - Total students
 * - Responded vs Not Responded
 * - Participation %
 * - Direct buttons to view Responded vs Not Responded
 */
export default function PollCard({ poll, onViewResponded, onViewNotResponded }) {
  const total = Number(poll.totalStudents) || 0;
  const responded = Number(poll.responded) || 0;
  const participationRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  return (
    <div className="poll-card">
      <div className="poll-card-header">
        <div>
          <span className="poll-category-pill">{poll.category || 'Survey'}</span>
          <h3 className="poll-card-title">{poll.title}</h3>
          {poll.description && <p className="poll-card-desc">{poll.description}</p>}
        </div>
        <span className={`poll-status-tag ${poll.status === 'Active' ? 'tag-active' : 'tag-closed'}`}>
          {poll.status}
        </span>
      </div>

      <div className="poll-metrics-grid">
        <div className="poll-metric-item">
          <span className="metric-label">Total Eligible</span>
          <span className="metric-value font-bold text-dark">{poll.totalStudents}</span>
        </div>
        <div className="poll-metric-item">
          <span className="metric-label">Responded</span>
          <span className="metric-value font-bold text-success">{poll.responded}</span>
        </div>
        <div className="poll-metric-item">
          <span className="metric-label">Not Responded</span>
          <span className="metric-value font-bold text-danger">{poll.notResponded}</span>
        </div>
        <div className="poll-metric-item">
          <span className="metric-label">Participation</span>
          <span className="metric-value font-bold text-primary">{participationRate}%</span>
        </div>
      </div>

      {/* Visual participation progress bar */}
      <div className="poll-progress-section">
        <div className="poll-progress-info">
          <span>Response Completion</span>
          <span className="font-semibold">{poll.responded} of {poll.totalStudents} ({participationRate}%)</span>
        </div>
        <div className="custom-progress-track">
          <div 
            className="custom-progress-bar progress-bar-blue" 
            style={{ width: `${participationRate}%` }}
          />
        </div>
      </div>

      {/* Action Buttons: The core feature */}
      <div className="poll-card-actions">
        <button
          type="button"
          className="btn btn-outline-success"
          onClick={() => onViewResponded(poll)}
        >
          <CheckIcon size={15} />
          <span>View Responded Students</span>
          <span className="badge-count-green">{poll.responded}</span>
        </button>

        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={() => onViewNotResponded(poll)}
        >
          <AlertCircleIcon size={15} />
          <span>View Not Responded Students</span>
          <span className="badge-count-red">{poll.notResponded}</span>
        </button>
      </div>
    </div>
  );
}
