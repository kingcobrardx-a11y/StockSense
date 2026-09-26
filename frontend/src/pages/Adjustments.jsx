import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ShieldCheck,
  Search
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import { mockAdjustments } from '../data/mockData';

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState(mockAdjustments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = adjustments.filter((a) => {
    const matchSearch =
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.sku.toLowerCase().includes(search.toLowerCase()) ||
      a.productName.toLowerCase().includes(search.toLowerCase()) ||
      a.reason.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleApprove = (id) => {
    setAdjustments((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'Approved', approvedBy: 'Alex Morgan (Signed)' }
          : item
      )
    );
  };

  const columns = [
    {
      header: 'Adjustment Ref',
      accessor: 'id',
      width: '130px',
      render: (row) => <span className="font-mono font-semibold text-cyan">{row.id}</span>,
    },
    {
      header: 'Product & SKU',
      accessor: 'productName',
      render: (row) => (
        <div>
          <span className="font-semibold text-white">{row.productName}</span>
          <div className="text-muted text-xs font-mono">{row.sku}</div>
        </div>
      ),
    },
    {
      header: 'System Qty',
      accessor: 'systemQty',
      align: 'right',
      render: (row) => <span className="font-mono text-secondary">{row.systemQty}</span>,
    },
    {
      header: 'Physical Count',
      accessor: 'physicalQty',
      align: 'right',
      render: (row) => <span className="font-mono font-semibold text-white">{row.physicalQty}</span>,
    },
    {
      header: 'Discrepancy',
      accessor: 'discrepancy',
      align: 'right',
      render: (row) => (
        <span
          className={`font-mono font-bold ${
            row.discrepancy > 0 ? 'text-emerald' : row.discrepancy < 0 ? 'text-rose' : 'text-secondary'
          }`}
        >
          {row.discrepancy > 0 ? `+${row.discrepancy}` : row.discrepancy}
        </span>
      ),
    },
    {
      header: 'Reason / Finding',
      accessor: 'reason',
      render: (row) => <span className="text-secondary text-xs">{row.reason}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '120px',
      render: (row) => <Badge dot>{row.status}</Badge>,
    },
    {
      header: 'Audit Sign-off',
      accessor: 'approvedBy',
      render: (row) => <span className="text-secondary text-xs">{row.approvedBy}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {row.status === 'Pending' ? (
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={() => handleApprove(row.id)}
            >
              Approve
            </Button>
          ) : (
            <span className="badge-pill badge-neutral badge-sm font-mono">Reconciled</span>
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
            <SlidersHorizontal size={24} className="text-rose" />
            <span>Stock Level Adjustments & Cycle Counts</span>
          </h1>
          <p>Audit variances, damage write-offs, shrinkage reconciliation, and supervisor sign-offs.</p>
        </div>

        <div className="page-actions">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => alert('New physical count variance logged.')}
          >
            Log Discrepancy
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="products-kpi-bar">
        <div className="kpi-mini">
          <span className="kpi-mini-title">Total Audit Entries</span>
          <span className="kpi-mini-val text-white">{adjustments.length}</span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Pending Review</span>
          <span className="kpi-mini-val text-amber">
            {adjustments.filter((a) => a.status === 'Pending').length}
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Approved & Balanced</span>
          <span className="kpi-mini-val text-emerald">
            {adjustments.filter((a) => a.status === 'Approved').length}
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Accuracy Rate</span>
          <span className="kpi-mini-val text-cyan">99.4%</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="products-controls-bar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter by adjustment ref, SKU, product, or reason..."
        />

        <div className="filter-pill-group">
          {['All', 'Approved', 'Pending'].map((st) => (
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
        emptyMessage="No inventory adjustments match the search criteria."
      />
    </div>
  );
}
