import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollText,
  Download,
  Filter,
  RefreshCw,
  Search
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { mockLedger } from '../data/mockData';
import { fetchLedgerTransactions, fetchWarehouses } from '../services/api';

export default function StockLedger() {
  const [ledger, setLedger] = useState(mockLedger);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [warehouseFilter, setWarehouseFilter] = useState('All');

  const loadLedgerData = async () => {
    try {
      const [txData, whData] = await Promise.all([
        fetchLedgerTransactions(),
        fetchWarehouses(),
      ]);

      if (Array.isArray(txData) && txData.length > 0) {
        // Map backend transaction schema to ledger row if coming from live API
        const formatted = txData.map((t) => {
          if (t.productName) return t; // Already formatted mock
          const isPositive = t.type === 'RECEIPT' || (t.type === 'ADJUSTMENT' && t.quantity > 0);
          return {
            id: `TXN-${String(t.id).padStart(4, '0')}`,
            timestamp: t.created_at ? new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:30 AM',
            type: t.type,
            productName: t.product_name || `Product #${t.product_id}`,
            sku: t.sku || `SKU-${t.product_id}`,
            quantityChange: t.type === 'TRANSFER' ? `${t.quantity}` : `${isPositive ? '+' : ''}${t.quantity}`,
            balanceAfter: '--',
            warehouse: t.warehouse_name || (t.warehouse_id === 1 ? 'Main Warehouse' : 'Production Unit'),
            referenceDoc: t.reference || 'SYSTEM',
            operator: 'Admin',
          };
        });
        setLedger(formatted);
      } else {
        setLedger(mockLedger);
      }
      setWarehouses(whData || []);
    } catch {
      setLedger(mockLedger);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLedgerData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadLedgerData();
  };

  const filtered = useMemo(() => {
    return ledger.filter((item) => {
      // Search
      const q = search.toLowerCase();
      const matchSearch =
        (item.id || '').toLowerCase().includes(q) ||
        (item.sku || '').toLowerCase().includes(q) ||
        (item.productName || '').toLowerCase().includes(q) ||
        (item.referenceDoc || '').toLowerCase().includes(q) ||
        (item.warehouse || '').toLowerCase().includes(q);

      // Type filter
      let matchType = true;
      if (typeFilter !== 'All') {
        matchType = (item.type || '').toUpperCase() === typeFilter.toUpperCase();
      }

      // Warehouse filter
      let matchWh = true;
      if (warehouseFilter !== 'All') {
        matchWh = (item.warehouse || '').toLowerCase().includes(warehouseFilter.toLowerCase());
      }

      return matchSearch && matchType && matchWh;
    });
  }, [ledger, search, typeFilter, warehouseFilter]);

  const columns = [
    {
      header: 'Time',
      accessor: 'timestamp',
      width: '100px',
      render: (row) => <span className="text-secondary text-xs font-mono">{row.timestamp}</span>,
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => (
        <div>
          <span className="font-semibold text-white">{row.productName}</span>
          <div className="text-muted text-xs font-mono">{row.sku}</div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      width: '110px',
      render: (row) => {
        let variant = 'info';
        let label = row.type;
        if (row.type === 'RECEIPT') {
          variant = 'success';
          label = 'IN';
        } else if (row.type === 'DELIVERY') {
          variant = 'danger';
          label = 'OUT';
        } else if (row.type.includes('TRANSFER')) {
          variant = 'warning';
          label = 'MOVE';
        } else if (row.type === 'ADJUSTMENT') {
          variant = 'purple';
          label = 'ADJ';
        }
        return <Badge variant={variant} dot size="sm">{label}</Badge>;
      },
    },
    {
      header: 'Qty',
      accessor: 'quantityChange',
      align: 'right',
      render: (row) => {
        const changeStr = String(row.quantityChange);
        const isPos = changeStr.startsWith('+');
        const isNeg = changeStr.startsWith('-');
        return (
          <span
            className={`font-mono font-bold ${
              isPos ? 'text-emerald' : isNeg ? 'text-rose' : 'text-cyan'
            }`}
          >
            {changeStr}
          </span>
        );
      },
    },
    {
      header: 'Warehouse',
      accessor: 'warehouse',
      render: (row) => <span className="text-secondary text-xs">{row.warehouse}</span>,
    },
    {
      header: 'Reference',
      accessor: 'referenceDoc',
      render: (row) => <span className="badge-pill badge-neutral badge-sm font-mono">{row.referenceDoc}</span>,
    },
  ];

  return (
    <div className="operations-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ScrollText size={24} className="text-cyan" />
            <span>Stock Ledger & Audit Trail</span>
          </h1>
          <p>Chronological immutable record of every inventory receipt, delivery, transfer, and adjustment.</p>
        </div>

        <div className="page-actions">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            className={refreshing ? 'spin-anim' : ''}
            onClick={handleRefresh}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Ledger'}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="products-controls-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter by product, SKU, reference, or warehouse..."
          width="320px"
        />

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Filter by Type */}
          <div className="filter-dropdown-wrap">
            <label className="filter-label" style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Types</option>
              <option value="RECEIPT">Receipt (IN)</option>
              <option value="DELIVERY">Delivery (OUT)</option>
              <option value="TRANSFER">Transfer (MOVE)</option>
              <option value="ADJUSTMENT">Adjustment (ADJ)</option>
            </select>
          </div>

          {/* Filter by Warehouse */}
          <div className="filter-dropdown-wrap">
            <label className="filter-label" style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Warehouse:</label>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Warehouses</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.name}>
                  {wh.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner message="Loading audit ledger records..." fullPage />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No ledger events match the current filter"
          description="Try broadening your search or resetting the active type filter."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch('');
            setTypeFilter('All');
            setWarehouseFilter('All');
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="No audit ledger records match the query."
        />
      )}
    </div>
  );
}
