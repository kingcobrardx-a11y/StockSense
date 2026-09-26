import React, { useState } from 'react';
import { Bell, Menu, User, ChevronDown, Check, Sparkles } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ onMenuToggle }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'Low Stock Alert', desc: 'Cement Bags dropped below 25 units', time: '10m ago', unread: true },
    { id: 2, title: 'Receipt Processed', desc: 'PO-001 (100 Steel Rods) received', time: '45m ago', unread: false },
    { id: 3, title: 'Transfer Completed', desc: '30 units moved to Production Unit', time: '2h ago', unread: false },
  ];

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button
          className="navbar-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>
        <div className="navbar-title-block">
          <span className="navbar-app-title">StockSense</span>
          <span className="navbar-app-subtitle">Inventory Management</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Live System Badge */}
        <div className="navbar-pill-badge">
          <span className="pill-dot" />
          <span>Live Sync</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="navbar-dropdown-wrapper">
          <button
            className="navbar-icon-btn"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="notification-badge">3</span>
          </button>

          {notificationsOpen && (
            <div className="notifications-dropdown-menu">
              <div className="dropdown-header">
                <span className="dropdown-title">Notifications</span>
                <span className="dropdown-badge">3 New</span>
              </div>
              <div className="notifications-list">
                {notifications.map((n) => (
                  <div key={n.id} className={`notification-item ${n.unread ? 'unread' : ''}`}>
                    <div className="notification-dot-indicator" />
                    <div className="notification-text-content">
                      <p className="notification-item-title">{n.title}</p>
                      <p className="notification-item-desc">{n.desc}</p>
                      <span className="notification-item-time">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <button
                  className="dropdown-footer-action"
                  onClick={() => setNotificationsOpen(false)}
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User / Profile Area */}
        <div className="navbar-dropdown-wrapper">
          <button
            className="navbar-profile-btn"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            aria-label="User Profile"
          >
            <div className="profile-avatar">
              <User size={16} />
            </div>
            <div className="profile-info-text">
              <span className="profile-name">Admin</span>
              <span className="profile-role">Manager</span>
            </div>
            <ChevronDown size={14} className="profile-arrow" />
          </button>

          {profileOpen && (
            <div className="profile-dropdown-menu">
              <div className="profile-menu-header">
                <p className="profile-menu-name">Admin User</p>
                <p className="profile-menu-email">admin@stocksense.internal</p>
              </div>
              <div className="profile-menu-divider" />
              <div className="profile-menu-item">
                <span>Facility: Main Warehouse</span>
              </div>
              <div className="profile-menu-item">
                <span>Role: Warehouse Administrator</span>
              </div>
              <div className="profile-menu-divider" />
              <button
                className="profile-menu-action"
                onClick={() => setProfileOpen(false)}
              >
                Close Menu
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
