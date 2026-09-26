import React, { useState, useEffect, useMemo } from 'react';
import { Boxes, RefreshCw, Filter, Warehouse as WarehouseIcon } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import SearchBar from '../components/SearchBar';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { fetchAllStock, fetchWarehouses } from '../services/api';
import './Stock.css';

export default function Stock() {
  const [stockList, setStockList] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const loadStockData = async () => {
    try {
      const [stockData, whData] = await Promise.all([
        fetchAllStock(),
        fetchWarehouses(),
      ]);
      setStockList(stockData || []);
      setWarehouses(whData || []);
    } catch (err) {
      console.error('Failed to load stock data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStockData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStockData();
  };

  // Filtered stock data
  const filteredStock = useMemo(() => {
    return stockList.filter((item) => {
      // Warehouse filter
      if (selectedWarehouse !== 'ALL') {
        const whId = Number(selectedWarehouse);
        if (item.warehouse_id !== whId && item.warehouse_name !== selectedWarehouse) {
          return false;
        }
      }

      // Status filter
      const reorderLevel = item.reorder_level || 20;
      let status = 'In Stock';
      if (item.quantity === 0) status = 'Out of Stock';
      else if (item.quantity <= reorderLevel) status = 'Low Stock';

      if (selectedStatus !== 'ALL' && status !== selectedStatus) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (item.product_name || '').toLowerCase().includes(q);
        const skuMatch = (item.sku || '').toLowerCase().includes(q);
        const whMatch = (item.warehouse_name || '').toLowerCase().includes(q);
        return nameMatch || skuMatch || whMatch;
      }

      return true;
    });
  }, [stockList, selectedWarehouse, selectedStatus, searchQuery]);

  const columns = [
    {
      header: 'Product',
      accessor: 'product_name',
      render: (row) => (
        <div className="stock-product-cell">
          <span className="stock-product-name">{row.product_name}</span>
          <span className="stock-product-sub">ID: #{row.product_id}</span>
        </div>
      ),
    },
    {
      header: 'SKU',
      accessor: 'sku',
      render: (row) => <span className="stock-sku-badge">{row.sku}</span>,
    },
    {
      header: 'Warehouse',
      accessor: 'warehouse_name',
      render: (row) => (
        <div className="stock-warehouse-cell">
          <WarehouseIcon size={14} className="wh-icon" />
          <span>{row.warehouse_name || `Warehouse #${row.warehouse_id}`}</span>
        </div>
      ),
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      align: 'right',
      render: (row) => (
        <span className="stock-quantity-val">
          <strong>{row.quantity}</strong> units
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      render: (row) => {
        const reorder = row.reorder_level || 20;
        let st = 'In Stock';
        if (row.quantity === 0) st = 'Out of Stock';
        else if (row.quantity <= reorder) st = 'Low Stock';
        return <StatusBadge status={st} />;
      },
    },
  ];

  return (
    <div className="stock-page">
      <PageHeader
        title="Current Inventory"
        subtitle="Live stock levels across all registered facilities and warehouses"
        badge={`${filteredStock.length} Records`}
        actions={
          <Button
            variant="outline"
            icon={<RefreshCw size={15} className={refreshing ? 'spin-icon' : ''} />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Stock'}
          </Button>
        }
      />

      {/* Control Bar: Search + Filters */}
      <div className="stock-controls-bar">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by product, SKU, warehouse..."
          width="320px"
        />

        <div className="stock-filters-row">
          <div className="filter-dropdown-wrap">
            <label className="filter-label">Warehouse:</label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Warehouses</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-dropdown-wrap">
            <label className="filter-label">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table / Content */}
      {loading ? (
        <LoadingSpinner message="Loading live inventory records..." fullPage />
      ) : filteredStock.length === 0 ? (
        <EmptyState
          title="No stock records found"
          description={
            searchQuery || selectedWarehouse !== 'ALL' || selectedStatus !== 'ALL'
              ? 'No items matched your current filters. Try resetting the filters.'
              : 'There are no active stock records in the system yet.'
          }
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedWarehouse('ALL');
            setSelectedStatus('ALL');
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredStock}
          keyField="id"
          pageSize={10}
        />
      )}
    </div>
  );
}
