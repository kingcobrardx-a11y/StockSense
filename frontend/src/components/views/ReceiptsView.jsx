import { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../common/Table';
import { SkeletonTable } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';

export function ReceiptsView({
  transactions = [],
  products = [],
  warehouses = [],
  loading = false,
  error = null,
  onRetry,
  onOpenReceiptModal,
}) {
  const [search, setSearch] = useState('');

  const receipts = useMemo(() => {
    return transactions.filter((t) => t.type === 'RECEIPT');
  }, [transactions]);

  const filteredReceipts = useMemo(() => {
    return receipts.filter((tx) => {
      const prod = products.find((p) => p.id === tx.product_id);
      const prodName = prod ? prod.name.toLowerCase() : '';
      const prodSku = prod ? prod.sku.toLowerCase() : '';
      const ref = (tx.reference || '').toLowerCase();
      const q = search.toLowerCase();
      return prodName.includes(q) || prodSku.includes(q) || ref.includes(q);
    });
  }, [receipts, products, search]);

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
          title="Could not load inventory receipts"
          message={error.message || 'Error fetching receipt transactions.'}
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
                placeholder="Search by PO #, product SKU or name..."
                aria-label="Search receipts by PO reference or product"
                icon="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                wrapperClassName="search-input-group"
              />
            </div>

            <Button
              variant="primary"
              icon="arrow-down-left"
              onClick={onOpenReceiptModal}
            >
              Record New Receipt
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {filteredReceipts.length === 0 ? (
            <EmptyState
              icon="receipts"
              title={search ? 'No matching receipts found' : 'No stock receipts logged'}
              description={
                search
                  ? 'Try searching with a different PO reference or product name.'
                  : 'Log inbound purchase deliveries to replenish warehouse stock.'
              }
              actionLabel={search ? 'Clear Search' : 'Receive First Stock Batch'}
              onAction={search ? () => setSearch('') : onOpenReceiptModal}
            />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>PO / Reference</TableHeaderCell>
                  <TableHeaderCell>Received Date</TableHeaderCell>
                  <TableHeaderCell>Product</TableHeaderCell>
                  <TableHeaderCell>Destination Warehouse</TableHeaderCell>
                  <TableHeaderCell align="right">Quantity Received</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReceipts.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <span className="reference-code">{tx.reference || `PO-REC-${tx.id}`}</span>
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
                      <span className="qty-positive">
                        +{(tx.quantity || 0).toLocaleString()} {getProductUnit(tx.product_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="receipt" dot>Received</Badge>
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
