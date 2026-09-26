import { Icon } from './Icons';

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`card ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`card-header ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`card-title ${className}`.trim()} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`card-description ${className}`.trim()} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`card-content ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`card-footer ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconVariant = 'primary', // 'primary' | 'success' | 'warning' | 'info'
  badge = null,
  onClick,
  className = '',
}) {
  const clickableClass = onClick ? 'stat-card-clickable' : '';
  
  return (
    <div className={`stat-card ${clickableClass} ${className}`.trim()} onClick={onClick}>
      <div className="stat-card-body">
        <div className="stat-card-meta">
          <span className="stat-card-title">{title}</span>
          <span className="stat-card-value">{value}</span>
          {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
        </div>
        {icon && (
          <div className={`stat-card-icon stat-icon-${iconVariant}`}>
            <Icon name={icon} size={24} />
          </div>
        )}
      </div>
      {badge && <div className="stat-card-footer">{badge}</div>}
    </div>
  );
}
