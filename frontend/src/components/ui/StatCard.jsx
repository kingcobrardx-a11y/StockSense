import React from 'react';
import './StatCard.css';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  changeType = 'positive', // positive | negative | warning | neutral
  accent = 'blue',         // blue | emerald | amber | rose | purple
  onClick,
  badge,
}) {
  return (
    <div
      className={`stat-card accent-${accent} ${onClick ? 'stat-card-clickable' : ''}`}
      onClick={onClick}
    >
      <div className="stat-card-top">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className={`stat-card-icon-wrap icon-accent-${accent}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="stat-card-main">
        <div className="stat-card-value">{value}</div>
        {badge && <span className="stat-card-badge">{badge}</span>}
      </div>

      {(subtitle || change) && (
        <div className="stat-card-footer">
          {change && (
            <span className={`stat-change-tag change-${changeType}`}>
              {change}
            </span>
          )}
          {subtitle && <span className="stat-subtitle-text">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
