import { Icon } from './Icons';
import { Button } from './Button';

export function EmptyState({
  icon = 'box',
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionLabel,
  onAction,
  actionIcon = 'plus',
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      <div className="empty-state-icon-wrapper">
        <Icon name={icon} size={32} className="empty-state-icon" />
      </div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-description">{description}</p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="empty-state-actions">
          {actionLabel && (
            <Button variant="primary" icon={actionIcon} onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
