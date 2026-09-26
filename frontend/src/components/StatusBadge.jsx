import React from 'react';
import './StatusBadge.css';

export default function StatusBadge({ status, label, className = '' }) {
  const normalizedStatus = (status || label || '').toString().toLowerCase().trim();

  // Determine badge visual style variant
  let variant = 'default';
  let dotColor = null;

  if (normalizedStatus.includes('in stock') || normalizedStatus.includes('healthy') || normalizedStatus === 'completed' || normalizedStatus === 'received' || normalizedStatus === 'success' || normalizedStatus === 'in') {
    variant = 'success';
    dotColor = '#10b981';
  } else if (normalizedStatus.includes('low stock') || normalizedStatus === 'pending' || normalizedStatus === 'warning' || normalizedStatus === 'move') {
    variant = 'warning';
    dotColor = '#f59e0b';
  } else if (normalizedStatus.includes('out of stock') || normalizedStatus === 'cancelled' || normalizedStatus === 'failed' || normalizedStatus === 'danger' || normalizedStatus === 'out') {
    variant = 'danger';
    dotColor = '#ef4444';
  } else if (normalizedStatus === 'transfer' || normalizedStatus === 'delivered' || normalizedStatus === 'info') {
    variant = 'info';
    dotColor = '#3b82f6';
  } else if (normalizedStatus === 'adjustment' || normalizedStatus === 'adj') {
    variant = 'purple';
    dotColor = '#8b5cf6';
  }

  const displayText = label || status || 'Unknown';

  return (
    <span className={`status-badge badge-${variant} ${className}`}>
      {dotColor && <span className="status-dot" style={{ backgroundColor: dotColor }} />}
      <span className="status-text">{displayText.toUpperCase()}</span>
    </span>
  );
}
