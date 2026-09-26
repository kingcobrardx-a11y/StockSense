import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Send,
  CheckCircle2,
  PackageCheck,
  MapPin,
  Clock,
  Printer
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import { mockDeliveries } from '../data/mockData';

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState(mockDeliveries);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = deliveries.filter((d) => {
    const matchSearch =
      d.doNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.customer.toLowerCase().includes(search.toLowerCase()) ||
      d.destination.toLowerCase().includes(search.toLowerCase()) ||
      d.carrier.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDispatch = (id) => {
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: 'In Transit' }
          : d
      )
    );
  };

  const columns = [
    {
      header: 'DO Number / ID',
      accessor: 'doNumber',
      width: '150px',
      render: (row) => (
        <div>
          <span className="font-mono font-semibold text-cyan">{row.doNumber}</span>
          <div className="text-muted text-xs font-mono">{row.id}</div>
        </div>
      ),
    },
    {
      header: 'Customer & Destination',
      accessor: 'customer',
      render: (row) => (
        <div>
          <div className="font-semibold text-white">{row.customer}</div>
          <div className="text-secondary text-xs" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <MapPin size={11} className="text-cyan" /> {row.destination}
          </div>
        </div>
      ),
    },
    {
      header: 'Units Count',
      accessor: 'itemsCount',
      align: 'right',
      render: (row) => <span className="font-mono font-semibold text-white">{row.itemsCount} pcs</span>,
    },
    {
      header: 'Carrier',
      accessor: 'carrier',
      render: (row) => <span className="text-secondary text-xs font-medium">{row.carrier}</span>,
    },
    {
      header: 'Priority',
      accessor: 'priority',
      width: '100px',
      render: (row) => (
        <Badge variant={row.priority === 'Urgent' ? 'danger' : 'neutral'} dot size="sm">
          {row.priority}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '130px',
      render: (row) => <Badge dot>{row.status}</Badge>,
    },
    {
      header: 'Est. Delivery',
      accessor: 'estimatedDelivery',
      render: (row) => <span className="font-mono text-secondary text-xs">{row.estimatedDelivery}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {row.status === 'Ready to Ship' ? (
            <Button
              variant="primary"
              size="sm"
              icon={Send}
              onClick={() => handleDispatch(row.id)}
            >
              Dispatch
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={() => alert(`Printing packing slip for ${row.doNumber}`)}
            >
              Slip
            </Button>
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
            <Truck size={24} className="text-blue" />
            <span>Outbound Delivery Orders (DO)</span>
          </h1>
          <p>Pick, pack, verify manifests, and dispatch outbound stock to distribution hubs.</p>
        </div>

        <div className="page-actions">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => alert('New Outbound DO Manifest generated.')}
          >
            Create Delivery Order
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="products-kpi-bar">
        <div className="kpi-mini">
          <span className="kpi-mini-title">Total Orders</span>
          <span className="kpi-mini-val text-white">{deliveries.length}</span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Ready to Ship</span>
          <span className="kpi-mini-val text-cyan">
            {deliveries.filter((d) => d.status === 'Ready to Ship').length}
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">In Transit</span>
          <span className="kpi-mini-val text-purple">
            {deliveries.filter((d) => d.status === 'In Transit').length}
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Delivered Today</span>
          <span className="kpi-mini-val text-emerald">
            {deliveries.filter((d) => d.status === 'Delivered').length}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="products-controls-bar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by DO #, customer, destination, or carrier..."
        />

        <div className="filter-pill-group">
          {['All', 'Ready to Ship', 'Packing', 'In Transit', 'Delivered'].map((st) => (
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
        emptyMessage="No delivery orders found matching the filter."
      />
    </div>
  );
}
