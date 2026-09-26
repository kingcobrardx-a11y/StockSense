import { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { StockStatusBadge } from '../common/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../common/Table';
import { SkeletonTable } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';

export function ProductsView({
  products = [],
  stockList = [],
  loading = false,
  error = null,
  onRetry,
  onOpenProductModal,
  onOpenTransactionModal,
}) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Compute stock per product
  const productsWithStock = useMemo(() => {
    return products.map((p) => {
      const totalQuantity = stockList
        .filter((s) => s.product_id === p.id)
        .reduce((sum, s) => sum + (s.quantity || 0), 0);
      return {
        ...p,
        totalQuantity,
      };
    });
  }, [products, stockList]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return productsWithStock.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        categoryFilter === 'ALL' || p.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [productsWithStock, search, categoryFilter]);

  if (loading) {
    return (
      <div className="view-container">
        <SkeletonTable rows={6} cols={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-container">
        <ErrorState
          title="Could not load products catalog"
          message={error.message || 'Error fetching products from backend.'}
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
                placeholder="Search products by SKU or name..."
                aria-label="Search products by SKU or name"
                icon="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                wrapperClassName="search-input-group"
              />
            </div>

            <div className="filter-select-wrapper">
              <Select
                value={categoryFilter}
                aria-label="Filter products by category"
                onChange={(e) => setCategoryFilter(e.target.value)}
                wrapperClassName="category-select-group"
              >
                <option value="ALL">All Categories ({categories.length})</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            <Button
              variant="primary"
              icon="plus"
              onClick={onOpenProductModal}
              className="add-product-btn"
            >
              Add Product
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {filteredProducts.length === 0 ? (
            <EmptyState
              icon="box"
              title={search || categoryFilter !== 'ALL' ? 'No matching products found' : 'Product catalog is empty'}
              description={
                search || categoryFilter !== 'ALL'
                  ? 'Try clearing the search query or changing the category filter.'
                  : 'Start tracking inventory by creating your first catalog product.'
              }
              actionLabel={search || categoryFilter !== 'ALL' ? 'Clear Search' : 'Add First Product'}
              onAction={
                search || categoryFilter !== 'ALL'
                  ? () => {
                      setSearch('');
                      setCategoryFilter('ALL');
                    }
                  : onOpenProductModal
              }
            />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>SKU</TableHeaderCell>
                  <TableHeaderCell>Product Name</TableHeaderCell>
                  <TableHeaderCell>Category</TableHeaderCell>
                  <TableHeaderCell align="center">Unit</TableHeaderCell>
                  <TableHeaderCell align="right">On Hand</TableHeaderCell>
                  <TableHeaderCell align="right">Reorder Level</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell align="right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <span className="sku-badge">{product.sku}</span>
                    </TableCell>
                    <TableCell>
                      <div className="table-item-title">{product.name}</div>
                      <div className="table-item-subtitle">ID: #{product.id}</div>
                    </TableCell>
                    <TableCell>
                      <span className="category-tag">{product.category || 'General'}</span>
                    </TableCell>
                    <TableCell align="center">
                      <span className="unit-label">{product.unit || 'pcs'}</span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="stock-qty-value">{(product.totalQuantity || 0).toLocaleString()}</span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="reorder-level-value">
                        {(product.reorder_level || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StockStatusBadge
                        quantity={product.totalQuantity}
                        reorderLevel={product.reorder_level}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <div className="row-action-buttons">
                        <Button
                          variant="outline"
                          size="sm"
                          icon="arrow-down-left"
                          title="Receive Stock"
                          onClick={() => onOpenTransactionModal('RECEIPT', product.id)}
                        >
                          Receive
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="arrow-up-right"
                          title="Deliver Stock"
                          onClick={() => onOpenTransactionModal('DELIVERY', product.id)}
                        >
                          Dispatch
                        </Button>
                      </div>
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
