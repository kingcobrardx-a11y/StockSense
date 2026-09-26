import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Building2,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { mockUserProfile, mockWarehouses } from '../../data/mockData';
import './Navbar.css';

export default function Navbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const [selectedWarehouse, setSelectedWarehouse] = useState(mockWarehouses[0].name);
  const [showWhDropdown, setShowWhDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: '3 items dropped below reorder safety stock', time: '10m ago', urgent: true },
    { id: 2, text: 'PO-78398 partial delivery received (850 units)', time: '45m ago', urgent: false },
    { id: 3, text: 'Transfer TRF-8812 en route to West Coast WH', time: '2h ago', urgent: false },
  ];

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        {/* Mobile menu trigger */}
        <button
          type="button"
          className="navbar-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Warehouse Selector Dropdown */}
        <div className="warehouse-picker">
          <Building2 size={16} className="warehouse-icon" />
          <div
            className="warehouse-selected-btn"
            onClick={() => setShowWhDropdown(!showWhDropdown)}
            role="button"
            tabIndex={0}
          >
            <div className="warehouse-info-stack">
              <span className="wh-label">ACTIVE FACILITY</span>
              <span className="wh-name">{selectedWarehouse}</span>
            </div>
            <ChevronDown size={14} className="wh-chevron" />
          </div>

          {showWhDropdown && (
            <div className="warehouse-dropdown-menu">
              <div className="dropdown-title">SELECT OPERATIONAL HUB</div>
              {mockWarehouses.map((wh) => (
                <div
                  key={wh.id}
                  className={`warehouse-dropdown-item ${selectedWarehouse === wh.name ? 'active-wh' : ''}`}
                  onClick={() => {
                    setSelectedWarehouse(wh.name);
                    setShowWhDropdown(false);
                  }}
                >
                  <div className="wh-item-main">
                    <span className="wh-item-name">{wh.name}</span>
                    <span className="wh-item-code">{wh.code} • {wh.location}</span>
                  </div>
                  <span className="wh-item-cap">{wh.capacityUsed}% Cap</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="navbar-right">
        {/* Global Quick Search Hint */}
        <div
          className="navbar-search-trigger"
          onClick={() => navigate('/products')}
          role="button"
          tabIndex={0}
        >
          <Search size={15} />
          <span>Quick search inventory...</span>
          <kbd className="search-kbd">⌘K</kbd>
        </div>

        {/* Live Status Pill */}
        <div className="system-live-badge">
          <span className="live-dot pulse" />
          <span className="system-live-text">Live Sync</span>
        </div>

        {/* Notifications */}
        <div className="nav-action-wrapper">
          <button
            type="button"
            className="nav-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
          >
            <Bell size={18} />
            <span className="nav-notif-ping" />
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notif-header">
                <span>Recent System Alerts</span>
                <span className="notif-count">3 New</span>
              </div>
              <div className="notif-list">
                {notifications.map((item) => (
                  <div key={item.id} className="notif-item">
                    {item.urgent ? (
                      <ShieldAlert size={16} className="notif-icon-urgent" />
                    ) : (
                      <CheckCircle2 size={16} className="notif-icon-info" />
                    )}
                    <div className="notif-body">
                      <p className="notif-text">{item.text}</p>
                      <span className="notif-time">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="notif-footer" onClick={() => setShowNotifications(false)}>
                Dismiss All
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <Link to="/profile" className="navbar-profile-pill">
          <div className="profile-avatar">
            {mockUserProfile.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="profile-text">
            <span className="profile-name">{mockUserProfile.name}</span>
            <span className="profile-role">Ops Director</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
