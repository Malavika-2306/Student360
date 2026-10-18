import React from 'react';

/**
 * Reusable StatusBadge component
 * Displays status with clean color coding and clear semantic meaning:
 * - Activity Detected: Emerald green
 * - No Activity Detected: Amber
 * - Data Unavailable: Slate/Red warning
 * - Active: Green
 * - Inactive: Red
 * - Interested: Green/Emerald
 * - Not Interested: Amber
 * - Not Responded: Red
 */
export default function StatusBadge({ status, text, type = 'status' }) {
  let badgeClass = 'badge-inactive';
  let displayText = text;

  // 1. Activity Roster & Platform Sync Specific Types
  if (type === 'activityDetection' || status === 'activity_detected' || status === 'Activity Detected') {
    badgeClass = 'badge-active-detected';
    displayText = displayText || 'Activity Detected';
  } else if (status === 'no_activity' || status === 'No Activity Detected') {
    badgeClass = 'badge-no-activity';
    displayText = displayText || 'No Activity Detected';
  } else if (status === 'data_unavailable' || status === 'Data Unavailable' || status === 'unavailable') {
    badgeClass = 'badge-data-unavailable';
    displayText = displayText || 'Data Unavailable';
  }
  // 2. Poll Answer Types
  else if (type === 'pollAnswer') {
    if (status === 'Interested') {
      badgeClass = 'badge-interested';
      displayText = displayText || 'Interested';
    } else if (status === 'Not Interested') {
      badgeClass = 'badge-not-interested';
      displayText = displayText || 'Not Interested';
    } else if (status === 'not_responded' || status === 'Not Responded') {
      badgeClass = 'badge-not-responded';
      displayText = displayText || 'Not Responded';
    } else {
      badgeClass = 'badge-neutral';
      displayText = displayText || status;
    }
  } 
  // 3. Default Active / Inactive
  else {
    const isPositive = status === true || status === 'Active' || status === 'active';
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
