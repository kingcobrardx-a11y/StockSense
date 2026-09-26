import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ArrowDownToLine,
  Truck,
  ArrowLeftRight,
  SlidersHorizontal,
  ScrollText,
  Settings,
  X,
  Layers,
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={19} /> },
    { label: 'Products', path: '/products', icon: <Package size={19} /> },
    { label: 'Stock', path: '/stock', icon: <Boxes size={19} /> },
    { label: 'Receipts', path: '/receipts', icon: <ArrowDownToLine size={19} /> },
    { label: 'Deliveries', path: '/deliveries', icon: <Truck size={19} /> },
    { label: 'Transfers', path: '/transfers', icon: <ArrowLeftRight size={19} /> },
    { label: 'Adjustments', path: '/adjustments', icon: <SlidersHorizontal size={19} /> },
    { label: 'Stock Ledger', path: '/ledger', icon: <ScrollText size={19} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={19} /> },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-area">
            <div className="brand-icon-box">
              <Layers size={22} className="brand-icon" />
            </div>
            <div className="brand-text-block">
              <span className="brand-name">
                Stock<span className="brand-accent">Sense</span>
              </span>
              <span className="brand-badge">WMS v1.0</span>
            </div>
          </div>
          {onClose && (
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-menu">
          <div className="sidebar-section-label">INVENTORY MENU</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'nav-item-active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Facility Quick Status Card */}
        <div className="sidebar-status-card">
          <div className="status-indicator-row">
            <span className="status-live-dot" />
            <span className="status-hub-name">System Online</span>
          </div>
          <p className="status-hub-detail">Main Warehouse &bull; CDC-01</p>
          <div className="status-progress-track">
            <div className="status-progress-fill" style={{ width: '74%' }} />
          </div>
          <div className="status-metrics-footer">
            <span>Storage Capacity</span>
            <span className="status-pct">74%</span>
          </div>
        </div>
      </aside>
    </>
  );
}
