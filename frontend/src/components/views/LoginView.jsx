import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Icon } from '../common/Icons';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export function LoginView({ onNavigate }) {
  const { login } = useAuth();
  const { success } = useToast();

  const [email, setEmail] = useState('sarah.jenkins@stocksense.io');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      login(email, password);
      setLoading(false);
      success('Welcome back, Sarah Jenkins! Signed in to StockSense.');
      if (onNavigate) onNavigate('dashboard');
    }, 400);
  };

  const handleQuickDemo = () => {
    setEmail('sarah.jenkins@stocksense.io');
    setPassword('demopassword123');
    login('sarah.jenkins@stocksense.io', 'demopassword123');
    success('Authenticated with Hackathon Demo Credentials.');
    if (onNavigate) onNavigate('dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo and Intro */}
        <div className="login-header">
          <div className="login-brand-icon">
            <Icon name="box" size={28} color="#ffffff" />
          </div>
          <h1 className="login-title">StockSense</h1>
          <p className="login-subtitle">
            Modular Inventory Management & Audit System
          </p>
        </div>

        {/* Demo Fast Login Banner */}
        <div className="demo-credentials-banner">
          <div className="demo-banner-header">
            <Icon name="info" size={16} />
            <span>Hackathon Evaluation Account</span>
          </div>
          <p className="demo-banner-text">
            Preloaded with Operations Lead credentials & live warehouse access.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleQuickDemo}
            className="demo-quick-btn"
          >
            Quick Sign In as Sarah (Manager) &rarr;
          </Button>
        </div>

        {/* Standard Sign In Form */}
        <form onSubmit={handleSubmit} className="form-stack">
          <Input
            label="Work Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            autoComplete="email"
          />

          <Input
            label="Security Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="login-submit-btn"
            icon="login"
          >
            Sign In to StockSense
          </Button>
        </form>

        {/* Footer Note */}
        <div className="login-footer">
          <span>Enterprise Inventory & Audit Control</span>
          <span className="login-badge-dot">•</span>
          <span>FastAPI + PostgreSQL Ready</span>
        </div>
      </div>
    </div>
  );
}
