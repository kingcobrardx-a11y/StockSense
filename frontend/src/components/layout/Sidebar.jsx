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
  );
}
