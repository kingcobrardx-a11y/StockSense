import React, { useState } from 'react';
import {
  Warehouse as WarehouseIcon,
  Building2,
  MapPin,
  User,
  Layers,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Plus
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { mockWarehouses } from '../data/mockData';
import './Warehouse.css';

export default function Warehouse() {
  const [warehouses, setWarehouses] = useState(mockWarehouses);

  return (
    <div className="warehouse-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <WarehouseIcon size={24} className="text-emerald" />
            <span>Fulfillment Facilities & Multi-Hub Network</span>
          </h1>
          <p>Real-time telemetry across distributed regional distribution centers, zones, and rack capacities.</p>
        </div>

        <div className="page-actions">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => alert('New Warehouse Hub onboarding wizard.')}
          >
            Provision New Hub
          </Button>
        </div>
      </div>

      {/* Network Overview Stats */}
      <div className="products-kpi-bar">
        <div className="kpi-mini">
          <span className="kpi-mini-title">Active Facilities</span>
          <span className="kpi-mini-val text-white">{warehouses.length} Hubs</span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Total Rack Bays</span>
          <span className="kpi-mini-val text-cyan">
            {warehouses.reduce((acc, w) => acc + w.totalBays, 0)} Bays
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Avg. Capacity Utilization</span>
          <span className="kpi-mini-val text-amber">
            {Math.round(warehouses.reduce((acc, w) => acc + w.capacityUsed, 0) / warehouses.length)}%
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Active SKUs Network</span>
          <span className="kpi-mini-val text-emerald">
            {warehouses.reduce((acc, w) => acc + w.activeSKUs, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Facility Detailed Cards */}
      <div className="warehouse-grid">
        {warehouses.map((wh) => {
          const isHighLoad = wh.capacityUsed > 85;

          return (
            <div key={wh.id} className="card warehouse-card">
              <div className="wh-card-top">
                <div className="wh-header-title-box">
                  <div className="wh-badge-code font-mono">{wh.code}</div>
                  <h3 className="wh-card-title">{wh.name}</h3>
                  <div className="wh-card-loc">
                    <MapPin size={13} className="text-cyan" />
                    <span>{wh.location}</span>
                  </div>
                </div>

                <Badge variant={isHighLoad ? 'warning' : 'success'} dot>
                  {wh.status}
                </Badge>
              </div>

              {/* Capacity Bar */}
              <div className="wh-capacity-section">
                <div className="wh-capacity-header">
                  <span className="text-secondary text-xs">Total Storage Occupancy</span>
                  <span className={`font-mono font-bold ${isHighLoad ? 'text-amber' : 'text-emerald'}`}>
                    {wh.capacityUsed}%
                  </span>
                </div>
                <div className="wh-capacity-track">
                  <div
                    className={`wh-capacity-fill ${isHighLoad ? 'fill-warning' : 'fill-success'}`}
                    style={{ width: `${wh.capacityUsed}%` }}
                  />
                </div>
              </div>

              {/* Quick Specs */}
              <div className="wh-specs-grid">
                <div className="wh-spec-box">
                  <span className="spec-label">Storage Bays</span>
                  <span className="spec-val text-white">{wh.totalBays}</span>
                </div>
                <div className="wh-spec-box">
                  <span className="spec-label">Catalog SKUs</span>
                  <span className="spec-val text-cyan">{wh.activeSKUs}</span>
                </div>
                <div className="wh-spec-box" style={{ gridColumn: 'span 2' }}>
                  <span className="spec-label">Site Operations Director</span>
                  <span className="spec-val text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={13} className="text-muted" /> {wh.manager}
                  </span>
                </div>
              </div>

              {/* Active Zones Breakdown */}
              <div className="wh-zones-section">
                <div className="zones-header-title">
                  <Layers size={14} className="text-cyan" />
                  <span>Configured Storage Zones</span>
                </div>

                <div className="zones-list">
                  {wh.zones.map((zone, zIdx) => (
                    <div key={zIdx} className="zone-row">
                      <div className="zone-info">
                        <span className="zone-name">{zone.name}</span>
                        <span className="zone-temp">
                          <Thermometer size={11} /> {zone.temp}
                        </span>
                      </div>

                      <div className="zone-gauge">
                        <span className="zone-pct font-mono">{zone.occupancy}%</span>
                        <div className="zone-bar-bg">
                          <div
                            className="zone-bar-fill"
                            style={{
                              width: `${zone.occupancy}%`,
                              backgroundColor: zone.occupancy > 90 ? '#ef4444' : zone.occupancy > 75 ? '#f59e0b' : '#34d399',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="wh-card-footer">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`Opening layout diagram for ${wh.name}`)}
                >
                  Bay Map
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  iconRight={ArrowRight}
                  onClick={() => alert(`Navigating to ${wh.name} dedicated station view`)}
                >
                  Manage Hub
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
