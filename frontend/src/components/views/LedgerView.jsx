import { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { TransactionBadge } from '../common/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../common/Table';
import { SkeletonTable } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';

export function LedgerView({
  transactions = [],
  products = [],
  warehouses = [],
  loading = false,
  error = null,
  onRetry,
  onOpenTransactionModal,
}) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;

      // Warehouse filter
      if (
        warehouseFilter !== 'ALL' &&
        String(tx.warehouse_id) !== String(warehouseFilter) &&
        String(tx.destination_warehouse_id) !== String(warehouseFilter)
      ) {
        return false;
      }

      // Search filter
      if (search.trim()) {
        const prod = products.find((p) => p.id === tx.product_id);
        const prodName = prod ? prod.name.toLowerCase() : '';
        const prodSku = prod ? prod.sku.toLowerCase() : '';
        const ref = (tx.reference || '').toLowerCase();
        const q = search.toLowerCase();
        return prodName.includes(q) || prodSku.includes(q) || ref.includes(q);
      }

      return true;
    });
  }, [transactions, products, typeFilter, warehouseFilter, search]);

  const getProductName = (id) => {
    const p = products.find((prod) => prod.id === id);
    return p ? p.name : `Product #${id}`;
  };

  const getProductSku = (id) => {
    const p = products.find((prod) => prod.id === id);
    return p ? p.sku : '';
  };

  const getProductUnit = (id) => {
    const p = products.find((prod) => prod.id === id);
    return p?.unit || 'units';
  };

  const getWarehouseName = (id) => {
    const w = warehouses.find((wh) => wh.id === id);
    return w ? w.name : `Warehouse #${id}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    return new Date(isoString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['ID', 'Date', 'Type', 'SKU', 'Product', 'Warehouse', 'Quantity', 'Unit', 'Reference'];
    const rows = filteredTransactions.map((tx) => {
      const prod = products.find((p) => p.id === tx.product_id);
      return [
        tx.id,
        tx.created_at || '',
        tx.type,
        prod?.sku || '',
        `"${(prod?.name || '').replace(/"/g, '""')}"`,
        `"${getWarehouseName(tx.warehouse_id)}"`,
        tx.quantity,
        prod?.unit || 'units',
        `"${(tx.reference || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `stocksense_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="view-container">
        <SkeletonTable rows={7} cols={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-container">
        <ErrorState
          title="Could not load Stock Ledger"
          message={error.message || 'Error fetching audit transactions.'}
          onRetry={onRetry}
        />
      </div>
    );
  }

  return (
    <div className="view-container">
      <Card>
        <CardHeader>
          <div className="filter-controls-row">
            <div className="search-bar-wrapper">
              <Input
                placeholder="Search audit trail by reference, SKU, product..."
                aria-label="Search audit trail by reference, SKU, or product"
                icon="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                wrapperClassName="search-input-group"
              />
            </div>

            <div className="filter-select-wrapper">
              <Select
                value={typeFilter}
                aria-label="Filter by transaction type"
                onChange={(e) => setTypeFilter(e.target.value)}
                wrapperClassName="type-select-group"
              >
                <option value="ALL">All Types</option>
                <option value="RECEIPT">Receipts Only</option>
                <option value="DELIVERY">Deliveries Only</option>
                <option value="TRANSFER">Transfers Only</option>
                <option value="ADJUSTMENT">Adjustments Only</option>
              </Select>
            </div>

            <div className="filter-select-wrapper">
              <Select
                value={warehouseFilter}
                aria-label="Filter by warehouse"
                onChange={(e) => setWarehouseFilter(e.target.value)}
                wrapperClassName="warehouse-select-group"
              >
                <option value="ALL">All Facilities</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="header-button-group">
              <Button
                variant="outline"
                icon="download"
                onClick={handleExportCSV}
                disabled={filteredTransactions.length === 0}
                title="Download CSV report"
              >
                Export CSV
              </Button>
              <Button
                variant="primary"
                icon="plus"
                onClick={() => onOpenTransactionModal('RECEIPT')}
              >
                Record Transaction
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredTransactions.length === 0 ? (
            <EmptyState
              icon="ledger"
              title={
                search || typeFilter !== 'ALL' || warehouseFilter !== 'ALL'
                  ? 'No transactions matching filters'
                  : 'Audit ledger is empty'
              }
              description={
                search || typeFilter !== 'ALL' || warehouseFilter !== 'ALL'
                  ? 'Try modifying your filter parameters or search terms.'
                  : 'All inventory receipts, sales dispatches, transfers, and cycle counts will be tracked here.'
              }
              actionLabel={
                search || typeFilter !== 'ALL' || warehouseFilter !== 'ALL'
                  ? 'Reset All Filters'
                  : 'Record First Transaction'
              }
              onAction={
                search || typeFilter !== 'ALL' || warehouseFilter !== 'ALL'
                  ? () => {
                      setSearch('');
                      setTypeFilter('ALL');
                      setWarehouseFilter('ALL');
                    }
                  : () => onOpenTransactionModal('RECEIPT')
              }
            />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Timestamp</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>Product</TableHeaderCell>
                  <TableHeaderCell>Warehouse / Route</TableHeaderCell>
                  <TableHeaderCell align="right">Quantity Delta</TableHeaderCell>
                  <TableHeaderCell>Document Reference</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <span className="tx-id-badge">#{tx.id}</span>
                    </TableCell>
                    <TableCell>
                      <span className="timestamp-text">{formatDate(tx.created_at)}</span>
                    </TableCell>
                    <TableCell>
                      <TransactionBadge type={tx.type} />
                    </TableCell>
                    <TableCell>
                      <div className="table-item-title">{getProductName(tx.product_id)}</div>
                      <div className="table-item-subtitle">{getProductSku(tx.product_id)}</div>
                    </TableCell>
                    <TableCell>
                      {tx.type === 'TRANSFER' ? (
                        <div className="transfer-route-display">
                          <span className="source-wh">
                            {getWarehouseName(tx.source_warehouse_id || tx.warehouse_id)}
                          </span>
                          <span className="route-arrow">&rarr;</span>
                          <span className="dest-wh">
                            {getWarehouseName(tx.destination_warehouse_id)}
                          </span>
                        </div>
                      ) : (
                        <span className="warehouse-badge">
                          {getWarehouseName(tx.warehouse_id)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <span
                        className={
                          tx.type === 'RECEIPT'
                            ? 'qty-positive'
                            : tx.type === 'DELIVERY'
                            ? 'qty-negative'
                            : tx.type === 'ADJUSTMENT'
                            ? 'qty-adjustment'
                            : 'qty-neutral'
                        }
                      >
                        {tx.type === 'RECEIPT'
                          ? `+${(tx.quantity || 0).toLocaleString()}`
                          : tx.type === 'DELIVERY'
                          ? `-${(tx.quantity || 0).toLocaleString()}`
                          : tx.type === 'ADJUSTMENT'
                          ? `Count: ${(tx.quantity || 0).toLocaleString()}`
                          : (tx.quantity || 0).toLocaleString()}{' '}
                        {getProductUnit(tx.product_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="reference-code">
                        {tx.reference || `REF-${tx.id}`}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
