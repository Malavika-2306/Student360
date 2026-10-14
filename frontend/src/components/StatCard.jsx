import React from 'react';

/**
 * Reusable StatCard component
 * Displays key metrics with rounded borders, subtle shadow, title, value, and description.
 */
export default function StatCard({ title, value, description, icon, trend, color = 'blue' }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {icon && <div className="stat-card-icon">{icon}</div>}
      </div>
      <div className="stat-card-body">
        <h3 className="stat-card-value">{value}</h3>
        {trend && (
          <span className={`stat-card-trend ${trend.isPositive ? 'trend-up' : 'trend-neutral'}`}>
            {trend.text}
          </span>
        )}
      </div>
      {description && <p className="stat-card-desc">{description}</p>}
    </div>
  );
}
