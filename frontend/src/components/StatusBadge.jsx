import React from 'react';

/**
 * Reusable StatusBadge component
 * Displays status with clean color coding:
 * - Active: green
 * - Inactive: red
 * - Interested: green/emerald
 * - Not Interested: slate/amber
 * - Not Responded: red/rose
 */
export default function StatusBadge({ status, text, type = 'status' }) {
  // If boolean was passed
  const isPositive = status === true || status === 'Active' || status === 'active' || status === 'Interested';
  const isNotInterested = status === 'Not Interested';
  const isNotResponded = status === 'not_responded' || status === 'Not Responded';

  let badgeClass = 'badge-inactive';
  let displayText = text;

  if (type === 'pollAnswer') {
    if (status === 'Interested') {
      badgeClass = 'badge-interested';
      displayText = displayText || 'Interested';
    } else if (isNotInterested) {
      badgeClass = 'badge-not-interested';
      displayText = displayText || 'Not Interested';
    } else if (isNotResponded) {
      badgeClass = 'badge-not-responded';
      displayText = displayText || 'Not Responded';
    } else {
      badgeClass = 'badge-neutral';
      displayText = displayText || status;
    }
  } else {
    // Normal active / inactive
    if (isPositive) {
      badgeClass = 'badge-active';
      displayText = displayText || 'Active';
    } else {
      badgeClass = 'badge-inactive';
      displayText = displayText || 'Inactive';
    }
  }

  return (
    <span className={`status-badge ${badgeClass}`}>
      <span className="badge-dot"></span>
      {displayText}
    </span>
  );
}
