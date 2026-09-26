import { Icon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';

export function Sidebar({ currentView, onNavigate, counts = {} }) {
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      description: 'Overview & Analytics',
    },
    {
      id: 'products',
      label: 'Products',
      icon: 'products',
      description: 'Catalog & Items',
      count: counts.products,
    },
    {
      id: 'receipts',
      label: 'Receipts',
      icon: 'receipts',
      description: 'Incoming Inventory',
      count: counts.receipts,
    },
    {
      id: 'deliveries',
      label: 'Deliveries',
      icon: 'deliveries',
      description: 'Outgoing Dispatches',
      count: counts.deliveries,
    },
    {
      id: 'transfers',
      label: 'Transfers',
      icon: 'transfers',
      description: 'Inter-Warehouse',
      count: counts.transfers,
    },
    {
      id: 'adjustments',
      label: 'Adjustments',
      icon: 'adjustments',
      description: 'Reconciliations',
      count: counts.adjustments,
    },
    {
      id: 'ledger',
      label: 'Stock Ledger',
      icon: 'ledger',
      description: 'Audit History',
      count: counts.totalTransactions,
    },
  ];

  return (
    <aside className="app-sidebar" aria-label="Main Navigation">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-icon">
          <Icon name="box" size={20} color="#ffffff" />
        </div>
        <div className="brand-text">
          <span className="brand-name">StockSense</span>
          <span className="brand-badge">SaaS MVP</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">INVENTORY OPERATIONS</div>
        <ul className="nav-list">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <li key={item.id} className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={`${item.label} - ${item.description}`}
                  aria-label={item.label}
                >
                  <span className="nav-icon">
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span className="nav-label">{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="nav-counter">{item.count}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / User Profile */}
      <div className="sidebar-footer">
        {user ? (
          <div className="user-profile-widget">
            <div className="user-avatar" title={user.name}>
              {user.avatar || 'US'}
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <button
              type="button"
              className="user-logout-btn"
              onClick={logout}
              title="Sign Out"
              aria-label="Sign out"
            >
              <Icon name="logout" size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="sidebar-login-prompt-btn"
            onClick={() => onNavigate('login')}
          >
            <Icon name="login" size={16} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
}
