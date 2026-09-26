import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Plus,
  CheckCircle2,
  Navigation,
  Clock,
  Warehouse,
  Boxes
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import { mockTransfers } from '../data/mockData';

export default function Transfers() {
  const [transfers, setTransfers] = useState(mockTransfers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = transfers.filter((t) => {
    const matchSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.sourceWarehouse.toLowerCase().includes(search.toLowerCase()) ||
      t.targetWarehouse.toLowerCase().includes(search.toLowerCase()) ||
      t.itemsSummary.toLowerCase().includes(search.toLowerCase()) ||
      t.vehicle.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleComplete = (id) => {
    setTransfers((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'Completed' }
          : item
      )
    );
  };

  const columns = [
    {
      header: 'Transfer Code',
      accessor: 'id',
      width: '130px',
      render: (row) => <span className="font-mono font-semibold text-cyan">{row.id}</span>,
    },
    {
      header: 'Source Origin',
      accessor: 'sourceWarehouse',
      render: (row) => (
        <div>
          <span className="font-medium text-white">{row.sourceWarehouse}</span>
          <div className="text-muted text-xs">Origin Location</div>
        </div>
      ),
    },
    {
      header: 'Destination Target',
      accessor: 'targetWarehouse',
      render: (row) => (
        <div>
          <span className="font-medium text-emerald">{row.targetWarehouse}</span>
          <div className="text-muted text-xs">Target Location</div>
        </div>
      ),
    },
    {
      header: 'Items & Units',
      accessor: 'itemsSummary',
      render: (row) => <span className="font-medium text-secondary text-xs">{row.itemsSummary}</span>,
    },
    {
      header: 'Logistics Asset',
      accessor: 'vehicle',
      render: (row) => <span className="badge-pill badge-neutral badge-sm font-mono">{row.vehicle}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '120px',
      render: (row) => <Badge dot>{row.status}</Badge>,
    },
    {
      header: 'ETA / Arrival',
      accessor: 'eta',
      render: (row) => <span className="font-mono text-secondary text-xs">{row.eta}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {row.status !== 'Completed' ? (
            <Button
              variant="outline"
              size="sm"
              icon={CheckCircle2}
              onClick={() => handleComplete(row.id)}
            >
              Confirm Delivery
            </Button>
          ) : (
            <span className="badge-pill badge-neutral badge-sm font-mono">Archived</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="operations-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ArrowLeftRight size={24} className="text-purple" />
            <span>Internal Warehouse Transfers</span>
          </h1>
          <p>Relocate stock across high-rack bays, pick stations, and regional sister distribution hubs.</p>
        </div>

        <div className="page-actions">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => alert('New transfer requisition initiated.')}
          >
            Initiate Transfer
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="products-kpi-bar">
        <div className="kpi-mini">
          <span className="kpi-mini-title">Total Active Moves</span>
          <span className="kpi-mini-val text-white">{transfers.length}</span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">In Transit</span>
          <span className="kpi-mini-val text-cyan">
            {transfers.filter((t) => t.status === 'In Transit').length}
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Scheduled</span>
          <span className="kpi-mini-val text-amber">
            {transfers.filter((t) => t.status === 'Scheduled').length}
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Completed Today</span>
          <span className="kpi-mini-val text-emerald">
            {transfers.filter((t) => t.status === 'Completed').length}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="products-controls-bar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter by transfer ID, source, target, or vehicle..."
        />

        <div className="filter-pill-group">
          {['All', 'In Transit', 'Scheduled', 'Completed'].map((st) => (
            <button
              key={st}
              type="button"
              className={`filter-pill ${statusFilter === st ? 'filter-pill-active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No internal transfers match your criteria."
      />
    </div>
  );
}
