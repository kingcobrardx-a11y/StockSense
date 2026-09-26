import { Button } from '../common/Button';

export function Header({
  title,
  subtitle,
  isApiHealthy = true,
  isRefreshing = false,
  onRefresh,
  primaryAction = null,
}) {
  return (
    <header className="app-header">
      <div className="header-titles">
        <h1 className="header-view-title">{title}</h1>
        {subtitle && <p className="header-view-subtitle">{subtitle}</p>}
      </div>

      <div className="header-actions">
        {/* Backend API Health Status Indicator */}
        <div
          className={`api-status-pill ${isApiHealthy ? 'api-online' : 'api-offline'}`}
          title={
            isApiHealthy
              ? 'Connected to StockSense FastAPI Backend'
              : 'Backend connection unavailable (Check http://localhost:8000)'
          }
        >
          <span className="status-ping-dot" aria-hidden="true" />
          <span className="status-text">
            {isApiHealthy ? 'API Online' : 'API Offline'}
          </span>
        </div>

        {/* Global Refresh Button */}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            icon="refresh"
            loading={isRefreshing}
            onClick={onRefresh}
            title="Reload data from server"
          >
            Refresh
          </Button>
        )}

        {/* Dynamic Context Action */}
        {primaryAction}
      </div>
    </header>
  );
}
