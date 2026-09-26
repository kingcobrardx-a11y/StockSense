import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  ArrowDownToLine,
  Truck,
  ArrowLeftRight,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  DollarSign,
  RotateCcw
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { dashboardService } from '../services/api';
import {
  mockProducts,
  mockLedger,
  mockReceipts,
  mockDeliveries,
  mockTransfers
} from '../data/mockData';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard summary from FastAPI backend
  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setFetchError(null);

    try {
      const data = await dashboardService.getDashboard();
      setDashboardData(data || {});
    } catch (err) {
      console.error('Failed to load dashboard telemetry:', err);
      setFetchError(err.message || 'Unable to connect to StockSense API');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await dashboardService.getDashboard();
        if (!ignore) {
          setDashboardData(data || {});
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to load dashboard telemetry:', err);
          setFetchError(err.message || 'Unable to connect to StockSense API');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Helper to safely parse API numeric values, safely falling back to 0
  const safeNumber = (val) => {
    if (val === null || val === undefined) return 0;
    const num = Number(val);
    return Number.isNaN(num) ? 0 : num;
  };

  // KPI Mappings from real backend response
  const totalProductsInStock = safeNumber(
    dashboardData?.total_products_in_stock ??
    dashboardData?.totalProductsInStock ??
    dashboardData?.total_products ??
    dashboardData?.totalProducts ??
    dashboardData?.total_stock_units ??
    0
  );

  const totalWarehouses = safeNumber(
    dashboardData?.total_warehouses ??
    dashboardData?.totalWarehouses ??
    0
  );

  const lowStockCount = safeNumber(
    dashboardData?.low_stock_count ??
    dashboardData?.lowStockCount ??
    dashboardData?.low_stock ??
    dashboardData?.lowStock ??
    0
  );

  const outOfStockCount = safeNumber(
    dashboardData?.out_of_stock_count ??
    dashboardData?.outOfStockCount ??
    dashboardData?.out_of_stock ??
    dashboardData?.outOfStock ??
    0
  );

  const lowAndOutOfStock = safeNumber(
    dashboardData?.low_and_out_of_stock ??
    dashboardData?.lowAndOutOfStock ??
    (lowStockCount + outOfStockCount)
  );

  const pendingReceipts = safeNumber(
    dashboardData?.pending_receipts ??
    dashboardData?.pendingReceipts ??
    dashboardData?.pending_receipts_count ??
    dashboardData?.pendingReceiptsCount ??
    0
  );

  const pendingDeliveries = safeNumber(
    dashboardData?.pending_deliveries ??
    dashboardData?.pendingDeliveries ??
    dashboardData?.pending_deliveries_count ??
    dashboardData?.pendingDeliveriesCount ??
    0
  );

  const internalTransfers = safeNumber(
    dashboardData?.internal_transfers ??
    dashboardData?.internalTransfers ??
    dashboardData?.internal_transfers_active ??
    dashboardData?.internalTransfersActive ??
    dashboardData?.active_transfers ??
    0
  );

  // Filter low and out of stock products
  const criticalStockItems = mockProducts.filter(
    (p) => p.status === 'Low Stock' || p.status === 'Out of Stock'
  );

  // Recent transactions table columns
  const transactionColumns = [
    {
      header: 'Txn ID',
      accessor: 'id',
      width: '120px',
      render: (row) => <span className="font-mono text-cyan">{row.id}</span>,
    },
    {
      header: 'Type',
      accessor: 'type',
      width: '130px',
      render: (row) => {
        let variant = 'info';
        if (row.type === 'RECEIPT') variant = 'success';
        if (row.type === 'DELIVERY') variant = 'purple';
        if (row.type === 'TRANSFER_OUT') variant = 'warning';
        if (row.type === 'ADJUSTMENT') variant = 'danger';
        return <Badge variant={variant} dot size="sm">{row.type.replace('_', ' ')}</Badge>;
      },
    },
    {
      header: 'Product & SKU',
      accessor: 'productName',
      render: (row) => (
        <div>
          <div className="font-medium text-white">{row.productName}</div>
          <div className="text-muted text-xs font-mono">{row.sku}</div>
        </div>
      ),
    },
    {
      header: 'Change',
      accessor: 'quantityChange',
      align: 'right',
      render: (row) => (
        <span
          className={`font-semibold font-mono ${
            row.quantityChange.startsWith('+') ? 'text-emerald' : 'text-rose'
          }`}
        >
          {row.quantityChange}
        </span>
      ),
    },
    {
      header: 'Balance',
      accessor: 'balanceAfter',
      align: 'right',
      render: (row) => <span className="font-mono font-medium text-white">{row.balanceAfter}</span>,
    },
    {
      header: 'Reference',
      accessor: 'referenceDoc',
      render: (row) => <span className="badge-pill badge-neutral badge-sm font-mono">{row.referenceDoc}</span>,
    },
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      render: (row) => <span className="text-secondary text-xs">{row.timestamp}</span>,
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Top Banner & Quick Controls */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <span>Operational Command Center</span>
            <span className="live-pill">
              <span className="live-dot pulse" /> Live
            </span>
          </h1>
          <p>Real-time telemetry, inventory velocity, and multi-hub stock balances.</p>
        </div>

        <div className="page-actions">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            className={isRefreshing ? 'spin-anim' : ''}
            disabled={isRefreshing || isLoading}
            onClick={handleRefresh}
          >
            {isRefreshing ? 'Syncing...' : 'Sync Telemetry'}
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={PlusCircle}
            onClick={() => navigate('/operations/receipts')}
          >
            New Receipt (PO)
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards Grid with Loading, Error, and Content States */}
      {fetchError && dashboardData && (
        <div className="dashboard-error-card">
          <div className="dashboard-error-icon">
            <AlertTriangle size={22} />
          </div>
          <div className="dashboard-error-title">Sync Telemetry Failed</div>
          <p className="dashboard-error-msg">{fetchError}</p>
          <Button
            variant="primary"
            size="sm"
            icon={RotateCcw}
            onClick={() => fetchDashboardData(true)}
          >
            Retry Sync
          </Button>
        </div>
      )}

      {isLoading && !dashboardData ? (
        <div className="dashboard-loading-card">
          <div className="loading-spinner" />
          <div className="loading-text">Loading dashboard telemetry from StockSense API...</div>
        </div>
      ) : fetchError && !dashboardData ? (
        <div className="dashboard-error-card">
          <div className="dashboard-error-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="dashboard-error-title">Unable to Connect to FastAPI Backend</div>
          <p className="dashboard-error-msg">{fetchError}</p>
          <Button
            variant="primary"
            size="sm"
            icon={RotateCcw}
            onClick={() => fetchDashboardData(false)}
          >
            Retry Connection
          </Button>
        </div>
      ) : (
        <div className="stat-grid">
          {/* 1. Total Products in Stock */}
          <StatCard
            title="Total Products in Stock"
            value={totalProductsInStock.toLocaleString()}
            subtitle={
              totalWarehouses > 0
                ? `Across ${totalWarehouses} fulfillment hub${totalWarehouses === 1 ? '' : 's'}`
                : 'Across fulfillment hubs'
            }
            icon={Package}
            accent="blue"
            change={totalProductsInStock > 0 ? `${totalProductsInStock} in catalog` : '0 in catalog'}
            changeType="positive"
            onClick={() => navigate('/products')}
          />

          {/* 2. Low / Out of Stock Items */}
          <StatCard
            title="Low & Out of Stock"
            value={lowAndOutOfStock}
            subtitle={`${outOfStockCount} critical out of stock`}
            icon={AlertTriangle}
            accent="rose"
            change={lowAndOutOfStock > 0 ? 'Action required' : 'Stock level healthy'}
            changeType={lowAndOutOfStock > 0 ? 'negative' : 'positive'}
            badge={`${outOfStockCount} Zero Stock`}
            onClick={() => navigate('/products')}
          />

          {/* 3. Pending Receipts */}
          <StatCard
            title="Pending Receipts"
            value={pendingReceipts}
            subtitle={pendingReceipts > 0 ? `${pendingReceipts} incoming arrivals` : 'No pending receipts'}
            icon={ArrowDownToLine}
            accent="amber"
            change={`${pendingReceipts} Expected POs`}
            changeType={pendingReceipts > 0 ? 'warning' : 'neutral'}
            onClick={() => navigate('/operations/receipts')}
          />

          {/* 4. Pending Deliveries */}
          <StatCard
            title="Pending Deliveries"
            value={pendingDeliveries}
            subtitle={pendingDeliveries > 0 ? `${pendingDeliveries} active dispatches` : 'No pending deliveries'}
            icon={Truck}
            accent="purple"
            change={`${pendingDeliveries} Active DOs`}
            changeType={pendingDeliveries > 0 ? 'positive' : 'neutral'}
            onClick={() => navigate('/operations/deliveries')}
          />

          {/* 5. Internal Transfers */}
          <StatCard
            title="Internal Transfers"
            value={internalTransfers}
            subtitle="Inter-bay and inter-facility"
            icon={ArrowLeftRight}
            accent="emerald"
            change={`${internalTransfers} Active Move Jobs`}
            changeType={internalTransfers > 0 ? 'positive' : 'neutral'}
            onClick={() => navigate('/operations/transfers')}
          />
        </div>
      )}

      {/* Middle Grid: Low Stock Alert Section + Operations Overview */}
      <div className="dashboard-grid-2col">
        {/* Low Stock Alerts Section */}
        <div className="card low-stock-card">
          <div className="card-header">
            <div>
              <div className="card-title text-rose-title">
                <ShieldAlert size={18} className="text-rose" />
                <span>Low & Critical Stock Watchlist</span>
              </div>
              <span className="card-subtitle">
                Items currently at or below minimum replenishment threshold
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconRight={ChevronRight}
              onClick={() => navigate('/products')}
            >
              All Inventory
            </Button>
          </div>

          <div className="low-stock-list">
            {criticalStockItems.map((item) => {
              const stockRatio = item.stock / item.minStock;
              const isOut = item.stock === 0;

              return (
                <div key={item.id} className={`low-stock-item ${isOut ? 'out-of-stock-border' : ''}`}>
                  <div className="item-meta-group">
                    <div className="item-title-row">
                      <span className="item-name">{item.name}</span>
                      <Badge variant={isOut ? 'danger' : 'warning'} dot size="sm">
                        {item.status}
                      </Badge>
                    </div>
                    <div className="item-sub-row">
                      <span className="font-mono text-muted">{item.sku}</span>
                      <span className="text-bullet">•</span>
                      <span className="text-secondary">{item.location}</span>
                      <span className="text-bullet">•</span>
                      <span className="text-muted">Supplier: {item.supplier}</span>
                    </div>
                  </div>

                  <div className="item-qty-group">
                    <div className="qty-numbers">
                      <span className={`qty-current ${isOut ? 'text-rose' : 'text-amber'}`}>
                        {item.stock}
                      </span>
                      <span className="qty-threshold">/ {item.minStock} min threshold</span>
                    </div>
                    <div className="qty-bar-bg">
                      <div
                        className={`qty-bar-fill ${isOut ? 'bar-danger' : 'bar-warning'}`}
                        style={{ width: `${Math.min(stockRatio * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="item-action-area">
                    <Button
                      variant={isOut ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => navigate('/operations/receipts')}
                    >
                      {isOut ? 'Emergency Restock' : 'Reorder'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Operations Pulse / Hub Summary */}
        <div className="card ops-summary-card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <TrendingUp size={18} className="text-cyan" />
                <span>Warehouse Velocity & Pipeline</span>
              </div>
              <span className="card-subtitle">Daily intake vs dispatch pipeline</span>
            </div>
            <span className="badge-pill badge-neutral badge-sm font-mono">Today</span>
          </div>

          <div className="velocity-metrics-grid">
            <div className="velocity-metric-box">
              <span className="metric-label">Inbound Volume</span>
              <span className="metric-val text-emerald">1,545 Units</span>
              <span className="metric-hint">3 Shipments received today</span>
            </div>

            <div className="velocity-metric-box">
              <span className="metric-label">Outbound Dispatched</span>
              <span className="metric-val text-blue">1,215 Units</span>
              <span className="metric-hint">7 Orders cleared for delivery</span>
            </div>

            <div className="velocity-metric-box">
              <span className="metric-label">Inter-Hub Moves</span>
              <span className="metric-val text-purple">510 Units</span>
              <span className="metric-hint">Optimal replenishment routing</span>
            </div>

            <div className="velocity-metric-box">
              <span className="metric-label">Storage Capacity</span>
              <span className="metric-val text-amber">78.4%</span>
              <span className="metric-hint">Healthy operational buffer</span>
            </div>
          </div>

          <div className="quick-nav-actions">
            <div className="quick-action-title">QUICK OPERATIONS SHORTCUTS</div>
            <div className="quick-btn-grid">
              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/operations/receipts')}
              >
                <ArrowDownToLine size={18} className="shortcut-icon icon-emerald" />
                <div className="shortcut-text">
                  <strong>Receive Goods</strong>
                  <span>Record PO arrival</span>
                </div>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/operations/deliveries')}
              >
                <Truck size={18} className="shortcut-icon icon-blue" />
                <div className="shortcut-text">
                  <strong>Create Delivery</strong>
                  <span>Generate pick/pack list</span>
                </div>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/operations/transfers')}
              >
                <ArrowLeftRight size={18} className="shortcut-icon icon-purple" />
                <div className="shortcut-text">
                  <strong>Transfer Stock</strong>
                  <span>Move between bays</span>
                </div>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/operations/adjustments')}
              >
                <AlertTriangle size={18} className="shortcut-icon icon-amber" />
                <div className="shortcut-text">
                  <strong>Audit Discrepancy</strong>
                  <span>Cycle count adjustment</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Inventory Transactions Section */}
      <div className="recent-transactions-section" style={{ marginTop: '24px' }}>
        <div className="section-header-row">
          <div>
            <h2 className="section-title">
              <Clock size={20} className="text-cyan" />
              <span>Recent Inventory Transactions</span>
            </h2>
            <p className="section-subtitle">
              Live audit trail of all warehouse movements, arrivals, and disbursements
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            iconRight={ArrowUpRight}
            onClick={() => navigate('/operations/ledger')}
          >
            View Full Stock Ledger
          </Button>
        </div>

        <DataTable
          columns={transactionColumns}
          data={mockLedger}
          pageSize={6}
          showPagination={false}
        />
      </div>
    </div>
  );
}
