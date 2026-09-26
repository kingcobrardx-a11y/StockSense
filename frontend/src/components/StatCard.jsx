import React from 'react';
import './StatCard.css';

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  color = 'blue', // 'blue' | 'emerald' | 'amber' | 'rose' | 'purple'
  onClick,
  className = '',
}) {
  return (
    <div
      className={`stat-card stat-card-${color} ${onClick ? 'clickable' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {icon && <div className={`stat-card-icon icon-${color}`}>{icon}</div>}
      </div>

      <div className="stat-card-body">
        <h3 className="stat-card-value">{value}</h3>
      </div>

      {(subtitle || trend) && (
        <div className="stat-card-footer">
          {trend && (
            <span className={`stat-trend ${trend.startsWith('+') ? 'trend-up' : 'trend-down'}`}>
              {trend}
            </span>
          )}
          {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
          {trendLabel && <span className="stat-card-trend-label">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
