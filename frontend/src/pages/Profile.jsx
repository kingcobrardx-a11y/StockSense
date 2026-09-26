import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Bell,
  Award,
  Clock,
  CheckCircle,
  Save,
  KeyRound,
  Building
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { mockUserProfile } from '../data/mockData';
import './Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState(mockUserProfile);
  const [notifications, setNotifications] = useState(mockUserProfile.notifications);
  const [savedMessage, setSavedMessage] = useState(false);

  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
    }, 2500);
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <User size={24} className="text-cyan" />
            <span>Operations Lead Profile & Settings</span>
          </h1>
          <p>Manage operator credentials, facility permissions, and automated notification streams.</p>
        </div>

        <div className="page-actions">
          {savedMessage && (
            <span className="badge-pill badge-success badge-md">
              <CheckCircle size={14} /> Preferences Saved
            </span>
          )}
          <Button variant="primary" size="md" icon={Save} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="profile-layout-grid">
        {/* Left Column: Profile Card & Role Badges */}
        <div className="profile-left-col">
          <div className="card profile-overview-card">
            <div className="profile-avatar-large">
              {profile.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <h2 className="profile-display-name">{profile.name}</h2>
            <div className="profile-role-title">{profile.role}</div>
            <Badge variant="purple" dot size="sm" className="profile-tier-badge">
              {profile.securityLevel}
            </Badge>

            <div className="profile-contact-list">
              <div className="profile-contact-item">
                <Mail size={15} className="contact-icon text-cyan" />
                <span>{profile.email}</span>
              </div>
              <div className="profile-contact-item">
                <Phone size={15} className="contact-icon text-emerald" />
                <span>{profile.phone}</span>
              </div>
              <div className="profile-contact-item">
                <Building size={15} className="contact-icon text-amber" />
                <span>{profile.location}</span>
              </div>
            </div>

            {/* Performance Metric Counters */}
            <div className="profile-kpis-grid">
              <div className="profile-kpi-item">
                <span className="kpi-num text-emerald">{profile.stats.inventoryAccuracyRate}</span>
                <span className="kpi-tag">Accuracy Rate</span>
              </div>
              <div className="profile-kpi-item">
                <span className="kpi-num text-cyan">{profile.stats.ordersApprovedThisMonth}</span>
                <span className="kpi-tag">Orders Approved</span>
              </div>
              <div className="profile-kpi-item">
                <span className="kpi-num text-purple">{profile.stats.transfersSupervised}</span>
                <span className="kpi-tag">Transfers Led</span>
              </div>
              <div className="profile-kpi-item">
                <span className="kpi-num text-amber">{profile.stats.activeFacilities}</span>
                <span className="kpi-tag">Active Hubs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences & Audit History */}
        <div className="profile-right-col">
          {/* Notification Preferences */}
          <div className="card settings-card">
            <div className="card-header">
              <div className="card-title">
                <Bell size={18} className="text-cyan" />
                <span>Automated Alert Subscriptions</span>
              </div>
              <span className="card-subtitle">Real-time alerts triggered by edge sensors and system logic</span>
            </div>

            <div className="toggle-list">
              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-title">Low Stock & Safety Stock Threshold Warnings</span>
                  <span className="toggle-desc">Instant notification whenever an item dips below safety reorder level</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.lowStockAlerts}
                    onChange={() => toggleNotification('lowStockAlerts')}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-title">Cycle Count Discrepancy Alerts</span>
                  <span className="toggle-desc">Receive notifications for variances requiring supervisor sign-off</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.discrepancyAlerts}
                    onChange={() => toggleNotification('discrepancyAlerts')}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-title">Inbound/Outbound Shipment Milestones</span>
                  <span className="toggle-desc">Alerts when PO shipments or customer deliveries change carrier status</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.shipmentTracking}
                    onChange={() => toggleNotification('shipmentTracking')}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-title">End-of-Day Operations Summary Digest</span>
                  <span className="toggle-desc">Daily compiled audit digest of warehouse movements and bay occupancies</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.dailySummaryEmail}
                    onChange={() => toggleNotification('dailySummaryEmail')}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>
          </div>

          {/* Recent Audit Timeline */}
          <div className="card activity-timeline-card" style={{ marginTop: '20px' }}>
            <div className="card-header">
              <div className="card-title">
                <Clock size={18} className="text-purple" />
                <span>Operator Audit Activity Trail</span>
              </div>
              <span className="card-subtitle">Recent actions logged under this profile session</span>
            </div>

            <div className="activity-timeline-list">
              {profile.recentActivity.map((act, idx) => (
                <div key={idx} className="timeline-entry">
                  <div className="timeline-marker" />
                  <div className="timeline-content">
                    <p className="timeline-action-text">{act.action}</p>
                    <span className="timeline-timestamp">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
