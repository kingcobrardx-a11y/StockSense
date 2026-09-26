import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Tag,
  Pencil,
  Trash2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  RotateCcw,
  Boxes,
  Search,
  RefreshCw
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import { productService } from '../services/api';
import './Products.css';

const DEFAULT_CATEGORIES = [
  'Raw Material',
  'Electronics',
  'Packaging',
  'Warehouse Equipment',
  'Safety & PPE',
  'Hardware',
];

const DEFAULT_UOMS = [
  'kg',
  'Units',
  'Rolls',
  'Boxes',
  'Packs',
  'Pieces',
  'Pairs',
  'Sets',
  'Meters',
  'Liters',
];

const INITIAL_FORM_STATE = {
  name: '',
  sku: '',
  category: 'Raw Material',
  unit: 'kg',
  reorder_level: 20,
};

export default function Products() {
  // 1. Products and Live Stocks from Backend
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // 2. Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // 3. Modal & Mutation States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = Add, object = Edit
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 4. Delete State
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 5. Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Modal Close Callback
  const handleCloseModal = useCallback(() => {
    if (isSubmitting) return; // Prevent closing while in flight
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setApiError(null);
  }, [isSubmitting]);

  // Keyboard shortcut to close modals on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (productToDelete && !isDeleting) setProductToDelete(null);
        else if (isModalOpen && !isSubmitting) handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, productToDelete, isSubmitting, isDeleting, handleCloseModal]);

  // 6. Fetch products and stocks from FastAPI Backend
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [productsData, stocksData] = await Promise.all([
        productService.getAll(),
        productService.getStock().catch(() => []),
      ]);

      const stockMap = {};
      if (Array.isArray(stocksData)) {
        stocksData.forEach((s) => {
          stockMap[s.product_id] = (stockMap[s.product_id] || 0) + (s.quantity || 0);
        });
      }

      setStocks(stockMap);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error('Failed to load products from backend:', err);
      setFetchError(err.message || 'Unable to connect to StockSense API');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function fetchInitial() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const [productsData, stocksData] = await Promise.all([
          productService.getAll(),
          productService.getStock().catch(() => []),
        ]);
        if (!ignore) {
          const stockMap = {};
          if (Array.isArray(stocksData)) {
            stocksData.forEach((s) => {
              stockMap[s.product_id] = (stockMap[s.product_id] || 0) + (s.quantity || 0);
            });
          }
          setStocks(stockMap);
          setProducts(Array.isArray(productsData) ? productsData : []);
        }
      } catch (err) {
        if (!ignore) {
          setFetchError(err.message || 'Unable to connect to StockSense API');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    fetchInitial();
    return () => {
      ignore = true;
    };
  }, []);

  // Available unique categories derived from current products and defaults
  const categories = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const statuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

  // Helper to compute live status for a product based on stock and reorder level
  const getProductStockAndStatus = useCallback(
    (product) => {
      const stock = stocks[product.id] || 0;
      const reorderLevel = Number(product.reorder_level) || 0;
      let status = 'In Stock';
      if (stock === 0) {
        status = 'Out of Stock';
      } else if (stock <= reorderLevel) {
        status = 'Low Stock';
      }
      return { stock, status };
    },
    [stocks]
  );

  // 7. Filtering Logic
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      const { status } = getProductStockAndStatus(item);
      const matchesStatus =
        selectedStatus === 'All' || status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus, getProductStockAndStatus]);

  // Active filter count
  const activeFiltersCount =
    (searchQuery.trim() !== '' ? 1 : 0) +
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedStatus !== 'All' ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
  };

  // 8. Modal Open Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setApiError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || 'Raw Material',
      unit: product.unit || 'kg',
      reorder_level:
        product.reorder_level !== undefined && product.reorder_level !== null
          ? product.reorder_level
          : 20,
    });
    setFormErrors({});
    setApiError(null);
    setIsModalOpen(true);
  };

  // 9. Form Field Change & Frontend Validation
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (apiError) setApiError(null);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Product name is required';
    } else if (formData.name.trim().length < 1) {
      errors.name = 'Product name must have at least 1 character';
    }

    if (!formData.sku || !formData.sku.trim()) {
      errors.sku = 'SKU / Code is required';
    }

    if (
      formData.reorder_level === '' ||
      formData.reorder_level === null ||
      isNaN(Number(formData.reorder_level)) ||
      Number(formData.reorder_level) < 0
    ) {
      errors.reorder_level = 'Reorder level must be 0 or higher';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 10. Submit Add / Edit Form to FastAPI Backend
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      category: formData.category.trim() || 'General',
      unit: formData.unit.trim() || 'Units',
      reorder_level: Number(formData.reorder_level) || 0,
    };

    try {
      if (editingProduct) {
        // PUT /products/{id}
        const updated = await productService.update(editingProduct.id, payload);
        // Only update state after backend succeeds
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? updated : p))
        );
        showToast(`Product "${updated.name}" (${updated.sku}) updated successfully.`);
      } else {
        // POST /products
        const created = await productService.create(payload);
        // Only update state after backend succeeds
        setProducts((prev) => [created, ...prev]);
        showToast(`Product "${created.name}" (${created.sku}) created successfully.`);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Backend operation failed:', err);
      setApiError(err.message || 'Operation failed on backend server.');
      showToast(err.message || 'Operation failed', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 11. Delete Product via DELETE /products/{id}
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const { id, name, sku } = productToDelete;
    setIsDeleting(true);
    try {
      await productService.delete(id);
      // Only update state after backend succeeds
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setProductToDelete(null);
      showToast(`Product "${name}" (${sku}) deleted successfully.`, 'danger');
    } catch (err) {
      console.error('Failed to delete product on backend:', err);
      showToast(err.message || 'Failed to delete product', 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  // 12. Table Columns Definition
  const columns = [
    {
      header: 'Product Name',
      accessor: 'name',
      render: (row) => (
        <div className="product-name-cell">
          <div className="product-icon-wrap" aria-hidden="true">
            <Package size={17} />
          </div>
          <div>
            <div className="product-title">{row.name}</div>
            <div className="product-subtitle">
              ID: <span className="font-mono">#{row.id}</span>
              {row.created_at
                ? ` • Added: ${new Date(row.created_at).toLocaleDateString()}`
                : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'SKU / Code',
      accessor: 'sku',
      width: '140px',
      render: (row) => <span className="sku-badge">{row.sku}</span>,
    },
    {
      header: 'Category',
      accessor: 'category',
      width: '160px',
      render: (row) => (
        <span className="category-pill">
          <Tag size={12} className="cat-icon" />
          <span>{row.category || 'General'}</span>
        </span>
      ),
    },
    {
      header: 'Unit of Measure',
      accessor: 'unit',
      width: '130px',
      render: (row) => <span className="uom-pill">{row.unit || 'Units'}</span>,
    },
    {
      header: 'Current Stock',
      accessor: 'stock',
      width: '180px',
      render: (row) => {
        const { stock } = getProductStockAndStatus(row);
        const reorder = Number(row.reorder_level) || 0;
        const maxVal = Math.max(reorder * 4, stock * 2, 100);
        const pct = Math.min(Math.max((stock / maxVal) * 100, stock > 0 ? 8 : 0), 100);

        return (
          <div className="product-stock-cell">
            <div className="stock-label-row">
              <span className="stock-num text-white">{stock.toLocaleString()}</span>
              <span className="stock-uom-suffix">{row.unit || 'Units'}</span>
              <span className="stock-bounds text-muted">/ min {reorder}</span>
            </div>
            <div
              className="stock-level-bar"
              title={`Current Stock: ${stock} ${row.unit || 'Units'} / Reorder Level: ${reorder}`}
            >
              <div
                className={`stock-fill ${
                  stock === 0
                    ? 'fill-danger'
                    : stock <= reorder
                    ? 'fill-warning'
                    : 'fill-success'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Stock Status',
      accessor: 'status',
      width: '135px',
      render: (row) => {
        const { status } = getProductStockAndStatus(row);
        return <Badge dot>{status}</Badge>;
      },
    },
    {
      header: 'Actions',
      align: 'center',
      width: '100px',
      render: (row) => (
        <div className="row-actions">
          <button
            type="button"
            className="action-icon-btn action-edit-btn"
            title="Edit product"
            aria-label={`Edit ${row.name}`}
            onClick={() => handleOpenEditModal(row)}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className="action-icon-btn action-delete-btn"
            title="Delete product"
            aria-label={`Delete ${row.name}`}
            onClick={() => setProductToDelete(row)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  // Counts for KPI pills
  const inStockCount = products.filter(
    (p) => getProductStockAndStatus(p).status === 'In Stock'
  ).length;
  const lowStockCount = products.filter(
    (p) => getProductStockAndStatus(p).status === 'Low Stock'
  ).length;
  const outOfStockCount = products.filter(
    (p) => getProductStockAndStatus(p).status === 'Out of Stock'
  ).length;

  return (
    <div className="products-page">
      {/* 1. Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Package size={24} className="text-cyan" />
            <span>Products Master Catalog</span>
          </h1>
          <p>
            Connected to StockSense FastAPI backend. Real-time items, SKU codes, and live inventory levels.
          </p>
        </div>

        <div className="page-actions">
          <span className="backend-status-badge">
            <span className="backend-status-dot" />
            API Connected
          </span>
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            onClick={loadData}
            disabled={isLoading}
            title="Reload products from backend"
          >
            {isLoading ? 'Syncing...' : 'Sync'}
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenAddModal}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* 2. Quick KPI Summary Bar (Clickable for fast status filtering) */}
      <div className="products-kpi-bar">
        <div
          className={`kpi-mini kpi-mini-clickable ${
            selectedStatus === 'All' ? 'kpi-mini-active' : ''
          }`}
          onClick={() => setSelectedStatus('All')}
          title="Click to view all items"
        >
          <span className="kpi-mini-title">Total Products</span>
          <span className="kpi-mini-val text-white">{products.length}</span>
        </div>

        <div
          className={`kpi-mini kpi-mini-clickable ${
            selectedStatus === 'In Stock' ? 'kpi-mini-active' : ''
          }`}
          onClick={() => setSelectedStatus(selectedStatus === 'In Stock' ? 'All' : 'In Stock')}
          title="Click to filter In Stock items"
        >
          <span className="kpi-mini-title">In Stock</span>
          <span className="kpi-mini-val text-emerald">{inStockCount}</span>
        </div>

        <div
          className={`kpi-mini kpi-mini-clickable ${
            selectedStatus === 'Low Stock' ? 'kpi-mini-active' : ''
          }`}
          onClick={() => setSelectedStatus(selectedStatus === 'Low Stock' ? 'All' : 'Low Stock')}
          title="Click to filter Low Stock items"
        >
          <span className="kpi-mini-title">Low Stock</span>
          <span className="kpi-mini-val text-amber">{lowStockCount}</span>
        </div>

        <div
          className={`kpi-mini kpi-mini-clickable ${
            selectedStatus === 'Out of Stock' ? 'kpi-mini-active' : ''
          }`}
          onClick={() => setSelectedStatus(selectedStatus === 'Out of Stock' ? 'All' : 'Out of Stock')}
          title="Click to filter Out of Stock items"
        >
          <span className="kpi-mini-title">Out of Stock</span>
          <span className="kpi-mini-val text-rose">{outOfStockCount}</span>
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="products-controls-bar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by product name or SKU code..."
        />

        {/* Category Pills */}
        <div className="filter-pill-group" role="group" aria-label="Filter by category">
          {categories.map((cat) => {
            const count =
              cat === 'All'
                ? products.length
                : products.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                className={`filter-pill ${selectedCategory === cat ? 'filter-pill-active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{cat}</span>
                <span className="filter-pill-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Status Filter & Reset Filters */}
        <div className="filters-right-group">
          <div className="status-filter-select-wrap">
            <select
              className="input-field select-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by stock status"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>
          </div>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              className="btn-reset-filters"
              onClick={handleResetFilters}
              title="Reset all active filters"
            >
              <RotateCcw size={13} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Products DataTable, Loading, or Empty States */}
      {isLoading && products.length === 0 ? (
        <div className="products-loading-card">
          <div className="loading-spinner" />
          <div className="loading-text">Loading products from StockSense API...</div>
        </div>
      ) : fetchError ? (
        <div className="backend-error-card">
          <div className="backend-error-icon">
            <AlertCircle size={28} />
          </div>
          <div className="backend-error-title">Unable to Connect to FastAPI Backend</div>
          <p className="backend-error-msg">{fetchError}</p>
          <Button variant="primary" icon={RotateCcw} onClick={loadData}>
            Retry Connection
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="card products-empty-state">
          <div className="empty-icon-wrap">
            <Boxes size={28} />
          </div>
          <div className="empty-title">No Products in Database Yet</div>
          <p className="empty-desc">
            The FastAPI backend returned an empty product catalog. Add your first product below to store it in the database.
          </p>
          <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
            Add First Product
          </Button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card products-empty-state">
          <div className="empty-icon-wrap">
            <Search size={28} />
          </div>
          <div className="empty-title">No Matching Products Found</div>
          <p className="empty-desc">
            {searchQuery
              ? `No inventory items matched your search "${searchQuery}".`
              : 'No inventory items match your current category and status filters.'}
          </p>
          <Button variant="outline" icon={RotateCcw} onClick={handleResetFilters}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredProducts}
          pageSize={10}
          emptyMessage="No products found matching your active filters."
        />
      )}

      {/* 5. Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
          >
            <div className="modal-header">
              <div className="modal-header-info">
                <div className="modal-header-icon">
                  {editingProduct ? <Pencil size={18} /> : <Plus size={18} />}
                </div>
                <h3 id="product-modal-title">
                  {editingProduct ? `Edit Product #${editingProduct.id}` : 'Add New Inventory Product'}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-form" noValidate>
              {/* Backend Error Banner */}
              {apiError && (
                <div className="modal-banner-error">
                  <AlertCircle size={16} />
                  <span>{apiError}</span>
                </div>
              )}

              {Object.keys(formErrors).length > 0 && !apiError && (
                <div className="modal-banner-error">
                  <AlertCircle size={16} />
                  <span>Please correct the highlighted fields before saving.</span>
                </div>
              )}

              <div className="form-grid">
                {/* Product Name */}
                <div className="form-group form-group-full">
                  <label htmlFor="prod-name">
                    <span>
                      Product Name <span className="label-required">*</span>
                    </span>
                  </label>
                  <input
                    id="prod-name"
                    type="text"
                    required
                    autoFocus
                    disabled={isSubmitting}
                    className={`input-field ${formErrors.name ? 'input-invalid' : ''}`}
                    placeholder="e.g. Steel Rods"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                  {formErrors.name && (
                    <div className="form-error">
                      <AlertCircle size={13} />
                      <span>{formErrors.name}</span>
                    </div>
                  )}
                </div>

                {/* SKU / Code */}
                <div className="form-group">
                  <label htmlFor="prod-sku">
                    <span>
                      SKU / Code <span className="label-required">*</span>
                    </span>
                    <span className="form-hint">Unique Identifier</span>
                  </label>
                  <input
                    id="prod-sku"
                    type="text"
                    required
                    disabled={isSubmitting}
                    className={`input-field font-mono ${formErrors.sku ? 'input-invalid' : ''}`}
                    placeholder="e.g. STL001"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                  />
                  {formErrors.sku && (
                    <div className="form-error">
                      <AlertCircle size={13} />
                      <span>{formErrors.sku}</span>
                    </div>
                  )}
                </div>

                {/* Category */}
                <div className="form-group">
                  <label htmlFor="prod-category">
                    <span>
                      Category <span className="label-required">*</span>
                    </span>
                  </label>
                  <select
                    id="prod-category"
                    disabled={isSubmitting}
                    className={`input-field ${formErrors.category ? 'input-invalid' : ''}`}
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <div className="form-error">
                      <AlertCircle size={13} />
                      <span>{formErrors.category}</span>
                    </div>
                  )}
                </div>

                {/* Unit of Measure */}
                <div className="form-group">
                  <label htmlFor="prod-uom">
                    <span>
                      Unit of Measure <span className="label-required">*</span>
                    </span>
                    <span className="form-hint">e.g. kg, Units, Box</span>
                  </label>
                  <select
                    id="prod-uom"
                    disabled={isSubmitting}
                    className={`input-field ${formErrors.unit ? 'input-invalid' : ''}`}
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                  >
                    {DEFAULT_UOMS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                  {formErrors.unit && (
                    <div className="form-error">
                      <AlertCircle size={13} />
                      <span>{formErrors.unit}</span>
                    </div>
                  )}
                </div>

                {/* Reorder Level */}
                <div className="form-group">
                  <label htmlFor="prod-reorder">
                    <span>
                      Reorder Level (Min Stock) <span className="label-required">*</span>
                    </span>
                    <span className="form-hint">Threshold</span>
                  </label>
                  <input
                    id="prod-reorder"
                    type="number"
                    min="0"
                    step="1"
                    required
                    disabled={isSubmitting}
                    className={`input-field ${formErrors.reorder_level ? 'input-invalid' : ''}`}
                    value={formData.reorder_level}
                    onChange={(e) => handleInputChange('reorder_level', e.target.value)}
                  />
                  {formErrors.reorder_level && (
                    <div className="form-error">
                      <AlertCircle size={13} />
                      <span>{formErrors.reorder_level}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? editingProduct
                      ? 'Saving Changes...'
                      : 'Creating Product...'
                    : editingProduct
                    ? 'Save Changes'
                    : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {productToDelete && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!isDeleting) setProductToDelete(null);
          }}
        >
          <div
            className="modal-card delete-confirm-card"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
          >
            <div className="delete-confirm-body">
              <div className="delete-warning-icon-wrap">
                <AlertTriangle size={24} />
              </div>
              <h3 id="delete-confirm-title" className="delete-confirm-title">
                Delete Product #{productToDelete.id}?
              </h3>
              <p className="delete-confirm-text">
                Are you sure you want to delete this inventory item from the database? This action will execute <code>DELETE /products/{productToDelete.id}</code> on the FastAPI backend.
                <span className="delete-target-highlight">
                  {productToDelete.name} ({productToDelete.sku})
                </span>
              </p>
              <div className="delete-modal-actions">
                <Button
                  variant="outline"
                  size="md"
                  disabled={isDeleting}
                  onClick={() => setProductToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  icon={Trash2}
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Product'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Toast Notification */}
      {toast && (
        <div
          className={`stocksense-toast toast-${toast.type}`}
          role="status"
          aria-live="polite"
        >
          <div className="toast-icon">
            {toast.type === 'danger' ? (
              <AlertCircle size={18} className="toast-icon-danger" />
            ) : (
              <CheckCircle2 size={18} className="toast-icon-success" />
            )}
          </div>
          <span>{toast.message}</span>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
