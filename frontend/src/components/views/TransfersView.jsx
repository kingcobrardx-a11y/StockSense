import { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../common/Table';
import { SkeletonTable } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';

export function TransfersView({
  transactions = [],
  products = [],
  warehouses = [],
  loading = false,
  error = null,
  onRetry,
  onOpenTransferModal,
}) {
  const [search, setSearch] = useState('');

  const transfers = useMemo(() => {
    return transactions.filter((t) => t.type === 'TRANSFER');
  }, [transactions]);

  const filteredTransfers = useMemo(() => {
    return transfers.filter((tx) => {
      const prod = products.find((p) => p.id === tx.product_id);
      const prodName = prod ? prod.name.toLowerCase() : '';
      const prodSku = prod ? prod.sku.toLowerCase() : '';
      const ref = (tx.reference || '').toLowerCase();
      const q = search.toLowerCase();
      return prodName.includes(q) || prodSku.includes(q) || ref.includes(q);
    });
  }, [transfers, products, search]);

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
          title="Could not load stock transfers"
          message={error.message || 'Error fetching warehouse transfers.'}
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
                placeholder="Search by transfer note, waybill, product..."
                aria-label="Search transfers by waybill or product"
                icon="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                wrapperClassName="search-input-group"
              />
            </div>

            <Button
              variant="primary"
              icon="repeat"
              onClick={onOpenTransferModal}
            >
              Initiate Stock Transfer
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {filteredTransfers.length === 0 ? (
            <EmptyState
              icon="transfers"
              title={search ? 'No matching transfers found' : 'No inter-warehouse transfers'}
              description={
                search
                  ? 'Try searching with another transfer reference or product name.'
                  : 'Rebalance inventory between fulfillment centers by transferring units.'
              }
              actionLabel={search ? 'Clear Search' : 'Initiate First Transfer'}
              onAction={search ? () => setSearch('') : onOpenTransferModal}
            />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Waybill / Ref</TableHeaderCell>
                  <TableHeaderCell>Transfer Date</TableHeaderCell>
                  <TableHeaderCell>Product</TableHeaderCell>
                  <TableHeaderCell>Transfer Route</TableHeaderCell>
                  <TableHeaderCell align="right">Quantity</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransfers.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <span className="reference-code">{tx.reference || `TRF-LOG-${tx.id}`}</span>
                    </TableCell>
                    <TableCell>
                      <span className="timestamp-text">{formatDate(tx.created_at)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="table-item-title">{getProductName(tx.product_id)}</div>
                      <div className="table-item-subtitle">{getProductSku(tx.product_id)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="transfer-route-display">
                        <span className="source-wh">
                          {getWarehouseName(tx.source_warehouse_id || tx.warehouse_id)}
                        </span>
                        <span className="route-arrow">&rarr;</span>
                        <span className="dest-wh">
                          {getWarehouseName(tx.destination_warehouse_id)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <span className="qty-neutral">
                        {(tx.quantity || 0).toLocaleString()} {getProductUnit(tx.product_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="transfer" dot>Transferred</Badge>
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
