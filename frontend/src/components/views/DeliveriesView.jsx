import { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../common/Table';
import { SkeletonTable } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';

export function DeliveriesView({
  transactions = [],
  products = [],
  warehouses = [],
  loading = false,
  error = null,
  onRetry,
  onOpenDeliveryModal,
}) {
  const [search, setSearch] = useState('');

  const deliveries = useMemo(() => {
    return transactions.filter((t) => t.type === 'DELIVERY');
  }, [transactions]);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((tx) => {
      const prod = products.find((p) => p.id === tx.product_id);
      const prodName = prod ? prod.name.toLowerCase() : '';
      const prodSku = prod ? prod.sku.toLowerCase() : '';
      const ref = (tx.reference || '').toLowerCase();
      const q = search.toLowerCase();
      return prodName.includes(q) || prodSku.includes(q) || ref.includes(q);
    });
  }, [deliveries, products, search]);

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
          title="Could not load outgoing deliveries"
          message={error.message || 'Error fetching delivery records.'}
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
                placeholder="Search by SO #, dispatch note, product..."
                icon="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                wrapperClassName="search-input-group"
              />
            </div>

            <Button
              variant="primary"
              icon="arrow-up-right"
              onClick={onOpenDeliveryModal}
            >
              Create Outgoing Delivery
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {filteredDeliveries.length === 0 ? (
            <EmptyState
              icon="deliveries"
              title={search ? 'No matching deliveries found' : 'No outgoing deliveries recorded'}
              description={
                search
                  ? 'Try searching with a different sales order or dispatch reference.'
                  : 'Fulfill customer orders and record outbound dispatches to deduct stock.'
              }
              actionLabel={search ? 'Clear Search' : 'Dispatch First Delivery'}
              onAction={search ? () => setSearch('') : onOpenDeliveryModal}
            />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>SO / Dispatch Note</TableHeaderCell>
                  <TableHeaderCell>Dispatch Date</TableHeaderCell>
                  <TableHeaderCell>Product</TableHeaderCell>
                  <TableHeaderCell>Fulfillment Warehouse</TableHeaderCell>
                  <TableHeaderCell align="right">Quantity Dispatched</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDeliveries.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <span className="reference-code">{tx.reference || `SO-DEL-${tx.id}`}</span>
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
                      <span className="qty-negative">
                        -{tx.quantity} {getProductUnit(tx.product_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="badge badge-delivery">Dispatched</span>
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
