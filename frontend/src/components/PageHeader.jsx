import React from 'react';
import './PageHeader.css';

export default function PageHeader({
  title,
  subtitle,
  actions,
  badge,
  className = '',
}) {
  return (
    <div className={`page-header ${className}`}>
      <div className="page-header-content">
        <div className="page-title-row">
          <h1 className="page-title">{title}</h1>
          {badge && <span className="page-badge">{badge}</span>}
        </div>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}
