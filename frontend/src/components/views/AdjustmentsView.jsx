import { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../common/Table';
import { SkeletonTable } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';

export function AdjustmentsView({
  transactions = [],
  products = [],
  warehouses = [],
  loading = false,
  error = null,
  onRetry,
  onOpenAdjustmentModal,
}) {
  const [search, setSearch] = useState('');

  const adjustments = useMemo(() => {
    return transactions.filter((t) => t.type === 'ADJUSTMENT');
  }, [transactions]);

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter((tx) => {
      const prod = products.find((p) => p.id === tx.product_id);
      const prodName = prod ? prod.name.toLowerCase() : '';
      const prodSku = prod ? prod.sku.toLowerCase() : '';
      const ref = (tx.reference || '').toLowerCase();
      const q = search.toLowerCase();
      return prodName.includes(q) || prodSku.includes(q) || ref.includes(q);
    });
  }, [adjustments, products, search]);

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

  if (loading) {
    return (
      <div className="view-container">
        <SkeletonTable rows={5} cols={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-container">
        <ErrorState
          title="Could not load stock adjustments"
          message={error.message || 'Error fetching inventory adjustments.'}
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
                placeholder="Search audit note, cycle count, product..."
                icon="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                wrapperClassName="search-input-group"
              />
            </div>

            <Button
              variant="primary"
              icon="sliders"
              onClick={onOpenAdjustmentModal}
            >
              Record Stock Adjustment
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {filteredAdjustments.length === 0 ? (
            <EmptyState
              icon="adjustments"
              title={search ? 'No matching adjustments found' : 'No cycle counts or adjustments'}
              description={
                search
                  ? 'Try searching with another audit reference or product name.'
                  : 'Reconcile stock discrepancies or log cycle counts to correct on-hand records.'
              }
              actionLabel={search ? 'Clear Search' : 'Record Physical Count'}
              onAction={search ? () => setSearch('') : onOpenAdjustmentModal}
            />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Audit Note / Ref</TableHeaderCell>
                  <TableHeaderCell>Adjustment Date</TableHeaderCell>
                  <TableHeaderCell>Product</TableHeaderCell>
                  <TableHeaderCell>Audited Facility</TableHeaderCell>
                  <TableHeaderCell align="right">Verified Count</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAdjustments.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <span className="reference-code">{tx.reference || `ADJ-AUD-${tx.id}`}</span>
                    </TableCell>
                    <TableCell>
                      <span className="timestamp-text">{formatDate(tx.created_at)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="table-item-title">{getProductName(tx.product_id)}</div>
                      <div className="table-item-subtitle">{getProductSku(tx.product_id)}</div>
                    </TableCell>
                    <TableCell>
                      <span className="warehouse-badge">{getWarehouseName(tx.warehouse_id)}</span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="qty-adjustment">
                        {tx.quantity} {getProductUnit(tx.product_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="badge badge-adjustment">Audited & Applied</span>
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
