<<<<<<< HEAD
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ArrowDownToLine,
  Truck,
  ArrowLeftRight,
  SlidersHorizontal,
  ScrollText,
  Warehouse,
  UserCheck,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Layers,
  X
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const isOperationsActive = location.pathname.startsWith('/operations');
  const [operationsOpen, setOperationsOpen] = useState(true);

  const toggleOperations = (e) => {
    e.preventDefault();
    setOperationsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="brand-logo-area">
            <div className="brand-icon-box">
              <Boxes size={22} className="brand-icon" />
            </div>
            <div className="brand-text-block">
              <div className="brand-name">
                Stock<span className="brand-accent">Sense</span>
              </div>
              <div className="brand-tag">INTELLIGENT WMS</div>
            </div>
          </div>
          {onClose && (
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">MAIN NAVIGATION</div>

          {/* 1. Dashboard */}
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            onClick={onClose}
          >
            <LayoutDashboard size={18} className="nav-icon" />
            <span className="nav-label">Dashboard</span>
          </NavLink>

          {/* 2. Products */}
          <NavLink
            to="/products"
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            onClick={onClose}
          >
            <Package size={18} className="nav-icon" />
            <span className="nav-label">Products</span>
            <span className="nav-badge-count">10</span>
          </NavLink>

          {/* 3. Operations Group */}
          <div className="nav-group">
            <div
              className={`nav-item nav-group-header ${isOperationsActive ? 'nav-item-active' : ''}`}
              onClick={toggleOperations}
              role="button"
              tabIndex={0}
            >
              <Boxes size={18} className="nav-icon" />
              <span className="nav-label">Operations</span>
              <span className="nav-group-arrow">
                {operationsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            </div>

            {operationsOpen && (
              <div className="nav-subitems">
                {/* Receipts */}
                <NavLink
                  to="/operations/receipts"
                  className={({ isActive }) => `nav-subitem ${isActive ? 'nav-subitem-active' : ''}`}
                  onClick={onClose}
                >
                  <ArrowDownToLine size={15} className="sub-icon" />
                  <span className="sub-label">Receipts</span>
                  <span className="sub-pill pill-amber">8</span>
                </NavLink>

                {/* Delivery Orders */}
                <NavLink
                  to="/operations/deliveries"
                  className={({ isActive }) => `nav-subitem ${isActive ? 'nav-subitem-active' : ''}`}
                  onClick={onClose}
                >
                  <Truck size={15} className="sub-icon" />
                  <span className="sub-label">Delivery Orders</span>
                  <span className="sub-pill pill-blue">12</span>
                </NavLink>

                {/* Internal Transfers */}
                <NavLink
                  to="/operations/transfers"
                  className={({ isActive }) => `nav-subitem ${isActive ? 'nav-subitem-active' : ''}`}
                  onClick={onClose}
                >
                  <ArrowLeftRight size={15} className="sub-icon" />
                  <span className="sub-label">Internal Transfers</span>
                  <span className="sub-pill pill-purple">6</span>
                </NavLink>

                {/* Inventory Adjustments */}
                <NavLink
                  to="/operations/adjustments"
                  className={({ isActive }) => `nav-subitem ${isActive ? 'nav-subitem-active' : ''}`}
                  onClick={onClose}
                >
                  <SlidersHorizontal size={15} className="sub-icon" />
                  <span className="sub-label">Adjustments</span>
                </NavLink>

                {/* Stock Ledger */}
                <NavLink
                  to="/operations/ledger"
                  className={({ isActive }) => `nav-subitem ${isActive ? 'nav-subitem-active' : ''}`}
                  onClick={onClose}
                >
                  <ScrollText size={15} className="sub-icon" />
                  <span className="sub-label">Stock Ledger</span>
                </NavLink>
              </div>
            )}
          </div>

          <div className="nav-section-title" style={{ marginTop: '16px' }}>SYSTEM & FACILITY</div>

          {/* 4. Warehouse */}
          <NavLink
            to="/warehouse"
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            onClick={onClose}
          >
            <Warehouse size={18} className="nav-icon" />
            <span className="nav-label">Warehouse</span>
            <span className="sub-pill pill-emerald">3 Hubs</span>
          </NavLink>

          {/* 5. Profile */}
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            onClick={onClose}
          >
            <UserCheck size={18} className="nav-icon" />
            <span className="nav-label">Profile</span>
          </NavLink>
        </nav>

        {/* Facility Status Card */}
        <div className="sidebar-facility-widget">
          <div className="facility-status-header">
            <span className="facility-dot live-dot pulse" />
            <span className="facility-status-title">CDC-CHI-01 Active</span>
          </div>
          <p className="facility-name">Central Distribution Center</p>
          <div className="facility-progress-wrap">
            <div className="facility-progress-bar" style={{ width: '78.4%' }} />
          </div>
          <div className="facility-stats-footer">
            <span>Storage Utilized</span>
            <span className="facility-pct">78.4%</span>
          </div>
        </div>
      </aside>
    </>
=======
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
>>>>>>> c197150040a9a054ee15843409aaa8adbd65fe06
  );
}
