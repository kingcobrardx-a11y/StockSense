import React from 'react';
import { PackageOpen, AlertCircle } from 'lucide-react';
import Button from './Button';
import './EmptyState.css';

export default function EmptyState({
  icon,
  title = 'No records found',
  description = 'There are currently no items to display.',
  actionLabel,
  onAction,
  actionIcon,
  isError = false,
  className = '',
}) {
  const defaultIcon = isError ? (
    <AlertCircle size={40} className="empty-icon-error" />
  ) : (
    <PackageOpen size={40} className="empty-icon-default" />
  );

  return (
    <div className={`empty-state-card ${isError ? 'is-error' : ''} ${className}`}>
      <div className="empty-state-icon-box">{icon || defaultIcon}</div>
      <h4 className="empty-state-title">{title}</h4>
      {description && <p className="empty-state-desc">{description}</p>}
      {actionLabel && onAction && (
        <div className="empty-state-action">
          <Button
            variant={isError ? 'outline' : 'primary'}
            onClick={onAction}
            icon={actionIcon}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
