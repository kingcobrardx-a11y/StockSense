import React, { useState, useEffect } from 'react';
import { Server, Database, Warehouse, Shield, CheckCircle, RefreshCw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Input from '../components/Input';
import Toast from '../components/Toast';
import { API_BASE_URL, fetchWarehouses, createWarehouse } from '../services/api';
import './Settings.css';

export default function Settings() {
  const [warehouses, setWarehouses] = useState([]);
  const [newWhName, setNewWhName] = useState('');
  const [newWhLocation, setNewWhLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  const loadSettingsData = async () => {
    try {
      const data = await fetchWarehouses();
      setWarehouses(data || []);
      // Check backend health
      const res = await fetch(`${API_BASE_URL}/`).catch(() => null);
      if (res && res.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleAddWarehouse = async (e) => {
    e.preventDefault();
    if (!newWhName.trim()) {
      setToast({ type: 'error', message: 'Warehouse name is required' });
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createWarehouse({
        name: newWhName.trim(),
        location: newWhLocation.trim() || undefined,
      });
      setWarehouses((prev) => [...prev, created]);
      setNewWhName('');
      setNewWhLocation('');
      setToast({ type: 'success', message: `Warehouse "${created.name}" created successfully!` });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to create warehouse' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="settings-page">
      <PageHeader
        title="Settings & System Configuration"
        subtitle="Manage warehouse facilities, API server parameters, and system status"
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="settings-grid">
        {/* System & API Status */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Server size={20} className="header-icon" />
            <h3 className="settings-card-title">Backend API Connection</h3>
          </div>
          <div className="settings-card-body">
            <div className="status-row">
              <span className="status-label">API Gateway:</span>
              <code className="status-code">{API_BASE_URL}</code>
            </div>
            <div className="status-row">
              <span className="status-label">Connection Status:</span>
              <span className={`status-pill ${backendStatus === 'connected' ? 'pill-connected' : 'pill-offline'}`}>
                <span className="dot" />
                {backendStatus === 'connected' ? 'Connected (FastAPI Live)' : 'Demo Fallback Mode'}
              </span>
            </div>
            <div className="status-row">
              <span className="status-label">Database Engine:</span>
              <span className="status-text">PostgreSQL 15+ / SQLAlchemy ORM</span>
            </div>
          </div>
        </div>

        {/* Warehouse Locations */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Warehouse size={20} className="header-icon" />
            <h3 className="settings-card-title">Facility Warehouses</h3>
          </div>
          <div className="settings-card-body">
            <div className="warehouse-list">
              {warehouses.map((wh) => (
                <div key={wh.id} className="warehouse-item">
                  <div className="wh-info">
                    <span className="wh-name">{wh.name}</span>
                    <span className="wh-location">{wh.location || 'Location not specified'}</span>
                  </div>
                  <span className="wh-id">ID #{wh.id}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddWarehouse} className="add-warehouse-form">
              <h4 className="form-subheading">Add New Warehouse</h4>
              <div className="wh-inputs-row">
                <Input
                  placeholder="Warehouse Name (e.g. West Hub)"
                  value={newWhName}
                  onChange={(e) => setNewWhName(e.target.value)}
                  required
                />
                <Input
                  placeholder="Location (e.g. Mohali)"
                  value={newWhLocation}
                  onChange={(e) => setNewWhLocation(e.target.value)}
                />
              </div>
              <Button type="submit" isLoading={isSubmitting} variant="primary">
                Add Facility
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
