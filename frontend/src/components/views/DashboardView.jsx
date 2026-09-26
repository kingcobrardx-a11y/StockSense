import { useMemo } from 'react';
import { StatCard, Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge, TransactionBadge } from '../common/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../common/Table';
import { SkeletonCard, SkeletonTable } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';

export function DashboardView({
  summary,
  products = [],
  warehouses = [],
  transactions = [],
  stockList = [],
  loading = false,
  error = null,
  onRetry,
  onNavigate,
  onOpenTransactionModal,
  onOpenProductModal,
  onOpenWarehouseModal,
}) {
  // Compute low stock items
  const lowStockCount = useMemo(() => {
    return products.filter((p) => {
      const totalUnits = stockList
        .filter((s) => s.product_id === p.id)
        .reduce((sum, s) => sum + s.quantity, 0);
      return totalUnits <= (p.reorder_level || 0);
    }).length;
  }, [products, stockList]);

  // Total stock units calculated if summary not available
  const totalStock = useMemo(() => {
    if (summary?.total_stock_units !== undefined) return summary.total_stock_units;
    return stockList.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [summary, stockList]);

  // Recent 6 transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 6);
  }, [transactions]);

  // Lookup helper
  const getProductName = (id) => {
    const p = products.find((prod) => prod.id === id);
    return p ? p.name : `Product #${id}`;
  };

  const getProductSku = (id) => {
    const p = products.find((prod) => prod.id === id);
    return p ? p.sku : '';
  };

  const getWarehouseName = (id) => {
    const w = warehouses.find((wh) => wh.id === id);
    return w ? w.name : `Warehouse #${id}`;
  };

  if (loading) {
    return (
      <div className="view-container">
        <SkeletonCard count={4} />
        <div style={{ marginTop: '24px' }}>
          <SkeletonTable rows={4} cols={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-container">
        <ErrorState
          title="Could not load inventory dashboard"
          message={error.message || 'Error communicating with StockSense backend.'}
          onRetry={onRetry}
        />
      </div>
    );
  }

  return (
    <div className="view-container">
      {/* KPI Metric Cards */}
      <div className="dashboard-stats-grid">
        <StatCard
          title="Total Catalog Products"
          value={summary?.total_products ?? products.length}
          subtitle="Active SKUs monitored"
          icon="box"
          iconVariant="primary"
          onClick={() => onNavigate('products')}
        />

        <StatCard
          title="Fulfillment Warehouses"
          value={summary?.total_warehouses ?? warehouses.length}
          subtitle="Storage & hub facilities"
          icon="building"
          iconVariant="info"
        />

        <StatCard
          title="Total Stock Units"
          value={totalStock.toLocaleString()}
          subtitle="Physical units in inventory"
          icon="arrow-down-left"
          iconVariant="success"
          onClick={() => onNavigate('ledger')}
        />

        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount}
          subtitle={lowStockCount > 0 ? 'Requires supplier reordering' : 'All items well stocked'}
          icon="alert-triangle"
          iconVariant={lowStockCount > 0 ? 'warning' : 'success'}
          badge={
            lowStockCount > 0 ? (
              <Badge variant="warning" size="sm" dot>
                Action Needed
              </Badge>
            ) : (
              <Badge variant="success" size="sm" dot>
                Optimal
              </Badge>
            )
          }
          onClick={() => onNavigate('products')}
        />
      </div>

      {/* Quick Action Bar */}
      <Card className="quick-actions-bar">
        <div className="quick-actions-content">
          <div className="quick-actions-label">
            <span className="quick-title">Quick Actions</span>
            <span className="quick-subtitle">Execute rapid inventory movements</span>
          </div>
          <div className="quick-action-buttons">
            <Button
              variant="primary"
              size="sm"
              icon="arrow-down-left"
              onClick={() => onOpenTransactionModal('RECEIPT')}
            >
              Receive Stock
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon="arrow-up-right"
              onClick={() => onOpenTransactionModal('DELIVERY')}
            >
              New Delivery
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon="repeat"
              onClick={() => onOpenTransactionModal('TRANSFER')}
            >
              Transfer Stock
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon="plus"
              onClick={onOpenProductModal}
            >
              Add Product
            </Button>
          </div>
        </div>
      </Card>

      {/* 2-Column Section: Recent Transactions & Warehouse Stock Breakdown */}
      <div className="dashboard-grid-split">
        {/* Recent Ledger Entries */}
        <Card className="dashboard-ledger-card">
          <CardHeader>
            <div>
              <CardTitle>Recent Stock Movements</CardTitle>
              <span className="card-subtitle-small">
                Last recorded inventory transactions
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('ledger')}
            >
              View Full Ledger &rarr;
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <EmptyState
                icon="ledger"
                title="No transactions recorded yet"
                description="Use the quick actions above to record stock receipts, deliveries, or transfers."
                actionLabel="Record Stock Receipt"
                onAction={() => onOpenTransactionModal('RECEIPT')}
              />
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Product</TableHeaderCell>
                    <TableHeaderCell>Warehouse</TableHeaderCell>
                    <TableHeaderCell align="right">Qty</TableHeaderCell>
                    <TableHeaderCell>Reference</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <TransactionBadge type={tx.type} />
                      </TableCell>
                      <TableCell>
                        <div className="table-item-title">{getProductName(tx.product_id)}</div>
                        <div className="table-item-subtitle">{getProductSku(tx.product_id)}</div>
                      </TableCell>
                      <TableCell>
                        {tx.type === 'TRANSFER' ? (
                          <span className="transfer-route">
                            {getWarehouseName(tx.source_warehouse_id || tx.warehouse_id)} &rarr;{' '}
                            {getWarehouseName(tx.destination_warehouse_id)}
                          </span>
                        ) : (
                          getWarehouseName(tx.warehouse_id)
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <span
                          className={
                            tx.type === 'RECEIPT'
                              ? 'qty-positive'
                              : tx.type === 'DELIVERY'
                              ? 'qty-negative'
                              : 'qty-neutral'
                          }
                        >
                          {tx.type === 'RECEIPT' ? '+' : tx.type === 'DELIVERY' ? '-' : ''}
                          {tx.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="reference-code">{tx.reference || `TX-${tx.id}`}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Warehouse Overview */}
        <Card className="dashboard-warehouses-card">
          <CardHeader>
            <div>
              <CardTitle>Warehouse Distribution</CardTitle>
              <span className="card-subtitle-small">
                Current stock concentration by facility
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon="plus"
              onClick={onOpenWarehouseModal}
            >
              Add Warehouse
            </Button>
          </CardHeader>
          <CardContent>
            {warehouses.length === 0 ? (
              <EmptyState
                icon="building"
                title="No warehouses registered"
                description="Add storage facilities to start distributing inventory."
                actionLabel="Create Warehouse"
                onAction={onOpenWarehouseModal}
              />
            ) : (
              <div className="warehouse-list">
                {warehouses.map((wh) => {
                  const whStockTotal = stockList
                    .filter((s) => s.warehouse_id === wh.id)
                    .reduce((sum, s) => sum + (s.quantity || 0), 0);

                  const distinctProducts = stockList.filter(
                    (s) => s.warehouse_id === wh.id && s.quantity > 0
                  ).length;

                  return (
                    <div key={wh.id} className="warehouse-item-card">
                      <div className="wh-icon-box">
                        <span className="wh-code">WH-{wh.id}</span>
                      </div>
                      <div className="wh-details">
                        <span className="wh-name">{wh.name}</span>
                        <span className="wh-location">{wh.location || 'Location unassigned'}</span>
                        <div className="wh-meta">
                          <span className="wh-meta-badge">
                            {distinctProducts} SKUs stored
                          </span>
                        </div>
                      </div>
                      <div className="wh-stat">
                        <span className="wh-units-value">{whStockTotal.toLocaleString()}</span>
                        <span className="wh-units-label">units on-hand</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
