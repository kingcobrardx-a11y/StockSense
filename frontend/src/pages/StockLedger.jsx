import React, { useState } from 'react';
import {
  ScrollText,
  Download,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  AlertCircle,
  FileCheck,
  Search
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import { mockLedger } from '../data/mockData';

export default function StockLedger() {
  const [ledger, setLedger] = useState(mockLedger);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = ledger.filter((item) => {
    const matchSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.referenceDoc.toLowerCase().includes(search.toLowerCase()) ||
      item.operator.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || item.type === typeFilter;
    return matchSearch && matchType;
  });

  const columns = [
    {
      header: 'Txn ID',
      accessor: 'id',
      width: '120px',
      render: (row) => <span className="font-mono font-semibold text-cyan">{row.id}</span>,
    },
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      width: '170px',
      render: (row) => <span className="text-secondary text-xs font-mono">{row.timestamp}</span>,
    },
    {
      header: 'Type',
      accessor: 'type',
      width: '140px',
      render: (row) => {
        let variant = 'info';
        if (row.type === 'RECEIPT') variant = 'success';
        if (row.type === 'DELIVERY') variant = 'purple';
        if (row.type.includes('TRANSFER')) variant = 'warning';
        if (row.type === 'ADJUSTMENT') variant = 'danger';
        return <Badge variant={variant} dot size="sm">{row.type.replace('_', ' ')}</Badge>;
      },
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
      header: 'Quantity Change',
      accessor: 'quantityChange',
      align: 'right',
      render: (row) => (
        <span
          className={`font-mono font-bold ${
            row.quantityChange.startsWith('+') ? 'text-emerald' : 'text-rose'
          }`}
        >
          {row.quantityChange}
        </span>
      ),
    },
    {
      header: 'Balance After',
      accessor: 'balanceAfter',
      align: 'right',
      render: (row) => <span className="font-mono font-semibold text-white">{row.balanceAfter}</span>,
    },
    {
      header: 'Ref Document',
      accessor: 'referenceDoc',
      render: (row) => <span className="badge-pill badge-neutral badge-sm font-mono">{row.referenceDoc}</span>,
    },
    {
      header: 'Hub / Operator',
      accessor: 'operator',
      render: (row) => (
        <div>
          <span className="text-white text-xs font-medium">{row.warehouse}</span>
          <div className="text-muted text-xs">{row.operator}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="operations-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ScrollText size={24} className="text-cyan" />
            <span>Immutable Stock Ledger & Audit Log</span>
          </h1>
          <p>Cryptographically aligned, chronological double-entry record of every unit moving through the network.</p>
        </div>

        <div className="page-actions">
          <Button
            variant="outline"
            size="md"
            icon={Download}
            onClick={() => alert('Stock Ledger exported as CSV.')}
          >
            Export CSV Audit
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="products-kpi-bar">
        <div className="kpi-mini">
          <span className="kpi-mini-title">Total Logged Entries</span>
          <span className="kpi-mini-val text-white">{ledger.length}</span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Inbound Receipts</span>
          <span className="kpi-mini-val text-emerald">
            {ledger.filter((l) => l.type === 'RECEIPT').length}
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Outbound Deliveries</span>
          <span className="kpi-mini-val text-purple">
            {ledger.filter((l) => l.type === 'DELIVERY').length}
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Audits / Adjusts</span>
          <span className="kpi-mini-val text-amber">
            {ledger.filter((l) => l.type === 'ADJUSTMENT').length}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="products-controls-bar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by Txn ID, SKU, product, PO/DO ref, or operator..."
        />

        <div className="filter-pill-group">
          {['All', 'RECEIPT', 'DELIVERY', 'TRANSFER_OUT', 'ADJUSTMENT'].map((type) => (
            <button
              key={type}
              type="button"
              className={`filter-pill ${typeFilter === type ? 'filter-pill-active' : ''}`}
              onClick={() => setTypeFilter(type)}
            >
              {type === 'TRANSFER_OUT' ? 'TRANSFER' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No ledger transactions found matching criteria."
      />
    </div>
  );
}
