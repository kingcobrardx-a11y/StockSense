import { Icon } from './Icons';
import { Button } from './Button';

export function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while fetching data from the server.',
  onRetry,
  compact = false,
  className = '',
}) {
  if (compact) {
    return (
      <div className={`alert-banner alert-banner-danger ${className}`.trim()} role="alert">
        <div className="alert-banner-icon">
          <Icon name="alert-triangle" size={18} />
        </div>
        <div className="alert-banner-content">
          <span className="alert-banner-title">{title}</span>
          <span className="alert-banner-message">{message}</span>
        </div>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} icon="refresh">
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`error-state-card ${className}`.trim()} role="alert">
      <div className="error-icon-wrapper">
        <Icon name="alert-triangle" size={32} />
      </div>
      <h4 className="error-title">{title}</h4>
      <p className="error-message">{message}</p>
      {onRetry && (
        <Button variant="primary" icon="refresh" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
