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
  Search
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import { mockProducts } from '../data/mockData';
import './Products.css';

const DEFAULT_CATEGORIES = [
  'Electronics',
  'Packaging',
  'Warehouse Equipment',
  'Safety & PPE',
  'Hardware',
];

const DEFAULT_UOMS = [
  'Units',
  'Rolls',
  'Boxes',
  'Packs',
  'Pieces',
  'Pairs',
  'Sets',
  'Meters',
  'kg',
];

const INITIAL_FORM_STATE = {
  name: '',
  sku: '',
  category: 'Electronics',
  unitOfMeasure: 'Units',
  stock: 10,
  minStock: 10,
  unitPrice: 0.00,
  location: '',
  supplier: '',
};

export default function Products() {
  // 1. Local State for Inventory Catalog
  const [products, setProducts] = useState(mockProducts);

  // 2. Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // 3. Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = Add, object = Edit
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [productToDelete, setProductToDelete] = useState(null);

  // 4. Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Keyboard shortcut to close modals on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (productToDelete) setProductToDelete(null);
        else if (isModalOpen) handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, productToDelete, handleCloseModal]);

  // Available unique categories derived from current products and defaults
  const categories = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const statuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

  // 5. Filtering Logic
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.supplier && item.supplier.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'All' || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

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

  // Helper to calculate status based on stock and min safety stock
  const calculateStatus = (stock, minStock) => {
    const s = Number(stock) || 0;
    const m = Number(minStock) || 10;
    if (s <= 0) return 'Out of Stock';
    if (s <= m) return 'Low Stock';
    return 'In Stock';
  };

  // 6. Modal Open/Close Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || 'Electronics',
      unitOfMeasure: product.unitOfMeasure || 'Units',
      stock: product.stock !== undefined ? product.stock : 0,
      minStock: product.minStock !== undefined ? product.minStock : 10,
      unitPrice: product.unitPrice !== undefined ? product.unitPrice : 0,
      location: product.location || '',
      supplier: product.supplier || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // 7. Form Field Change & Validation
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error as user types
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Product Name validation
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Product name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Product name must be at least 2 characters';
    }

    // SKU Code validation
    if (!formData.sku || !formData.sku.trim()) {
      errors.sku = 'SKU / Code is required';
    } else {
      const normalizedSku = formData.sku.trim().toUpperCase();
      const duplicate = products.find(
        (p) =>
          (!editingProduct || p.id !== editingProduct.id) &&
          p.sku.toUpperCase() === normalizedSku
      );
      if (duplicate) {
        errors.sku = `SKU "${normalizedSku}" is already in use by "${duplicate.name}"`;
      }
    }

    // Category validation
    if (!formData.category || !formData.category.trim()) {
      errors.category = 'Category is required';
    }

    // Unit of Measure validation
    if (!formData.unitOfMeasure || !formData.unitOfMeasure.trim()) {
      errors.unitOfMeasure = 'Unit of Measure is required';
    }

    // Stock validation
    if (
      formData.stock === '' ||
      formData.stock === null ||
      isNaN(Number(formData.stock)) ||
      Number(formData.stock) < 0
    ) {
      errors.stock = 'Stock must be a non-negative number (0 or higher)';
    }

    // Min Safety Stock validation
    if (
      formData.minStock !== '' &&
      (isNaN(Number(formData.minStock)) || Number(formData.minStock) < 0)
    ) {
      errors.minStock = 'Min safety stock must be a non-negative number';
    }

    // Unit Price validation
    if (
      formData.unitPrice !== '' &&
      (isNaN(Number(formData.unitPrice)) || Number(formData.unitPrice) < 0)
    ) {
      errors.unitPrice = 'Unit price cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 8. Submit Add / Edit Form
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const parsedStock = Number(formData.stock) || 0;
    const parsedMinStock = Number(formData.minStock) || 10;
    const parsedPrice = Number(formData.unitPrice) || 0;
    const status = calculateStatus(parsedStock, parsedMinStock);

    if (editingProduct) {
      // Update existing product
      const updatedProduct = {
        ...editingProduct,
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        category: formData.category.trim(),
        unitOfMeasure: formData.unitOfMeasure.trim(),
        stock: parsedStock,
        minStock: parsedMinStock,
        maxStock: Math.max(parsedMinStock * 4, parsedStock * 2, 100),
        unitPrice: parsedPrice,
        location: formData.location.trim() || 'Unassigned Bay',
        supplier: formData.supplier.trim() || 'General Supplier',
        status,
      };

      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
      );
      showToast(`Product "${updatedProduct.name}" (${updatedProduct.sku}) updated successfully.`);
    } else {
      // Create new product
      const newId = `PRD-${Date.now().toString().slice(-4)}`;
      const createdProduct = {
        id: newId,
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        category: formData.category.trim(),
        unitOfMeasure: formData.unitOfMeasure.trim(),
        stock: parsedStock,
        minStock: parsedMinStock,
        maxStock: Math.max(parsedMinStock * 4, parsedStock * 2, 100),
        unitPrice: parsedPrice,
        location: formData.location.trim() || 'Zone A - General Bay',
        supplier: formData.supplier.trim() || 'StockSense Inbound',
        status,
        lastRestocked: new Date().toISOString().split('T')[0],
      };

      setProducts((prev) => [createdProduct, ...prev]);
      showToast(`Product "${createdProduct.name}" (${createdProduct.sku}) created successfully.`);
    }

    handleCloseModal();
  };

  // 9. Delete Product Logic
  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    const { id, name, sku } = productToDelete;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setProductToDelete(null);
    showToast(`Product "${name}" (${sku}) deleted from catalog.`, 'danger');
  };

  const handleRestoreSampleData = () => {
    setProducts(mockProducts);
    handleResetFilters();
    showToast('Sample products catalog restored.');
  };

  // 10. Table Columns Definition
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
              ID: <span className="font-mono">{row.id}</span>
              {row.location ? ` • ${row.location}` : ''}
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
          <span>{row.category}</span>
        </span>
      ),
    },
    {
      header: 'Unit of Measure',
      accessor: 'unitOfMeasure',
      width: '130px',
      render: (row) => (
        <span className="uom-pill">{row.unitOfMeasure || 'Units'}</span>
      ),
    },
    {
      header: 'Current Stock',
      accessor: 'stock',
      width: '180px',
      render: (row) => {
        const minVal = row.minStock || 10;
        const maxVal = row.maxStock || Math.max(minVal * 4, 100);
        const pct = Math.min(Math.max((row.stock / maxVal) * 100, row.stock > 0 ? 8 : 0), 100);
        return (
          <div className="product-stock-cell">
            <div className="stock-label-row">
              <span className="stock-num text-white">{row.stock.toLocaleString()}</span>
              <span className="stock-uom-suffix">{row.unitOfMeasure || 'Units'}</span>
              <span className="stock-bounds text-muted">/ min {minVal}</span>
            </div>
            <div className="stock-level-bar" title={`Current: ${row.stock} / Safety: ${minVal}`}>
              <div
                className={`stock-fill ${
                  row.stock === 0
                    ? 'fill-danger'
                    : row.stock <= minVal
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
      render: (row) => <Badge dot>{row.status}</Badge>,
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
  const inStockCount = products.filter((p) => p.status === 'In Stock').length;
  const lowStockCount = products.filter((p) => p.status === 'Low Stock').length;
  const outOfStockCount = products.filter((p) => p.status === 'Out of Stock').length;

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
            Manage warehouse inventory items, SKU codes, categories, units of measure, and live stock statuses.
          </p>
        </div>

        <div className="page-actions">
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

      {/* 2. Quick KPI Summary Bar (Clickable for fast filtering) */}
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

      {/* 4. Products DataTable or Empty States */}
      {products.length === 0 ? (
        <div className="card products-empty-state">
          <div className="empty-icon-wrap">
            <Boxes size={28} />
          </div>
          <div className="empty-title">Inventory Catalog is Empty</div>
          <p className="empty-desc">
            No products currently exist in your local warehouse inventory registry.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
              Add First Product
            </Button>
            <Button variant="outline" icon={RotateCcw} onClick={handleRestoreSampleData}>
              Restore Sample Data
            </Button>
          </div>
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
                  {editingProduct ? 'Edit Product Details' : 'Add New Inventory Product'}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-form" noValidate>
              {Object.keys(formErrors).length > 0 && (
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
                    className={`input-field ${formErrors.name ? 'input-invalid' : ''}`}
                    placeholder="e.g. Industrial Barcode Scanner X5"
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
                    className={`input-field font-mono ${formErrors.sku ? 'input-invalid' : ''}`}
                    placeholder="e.g. SKU-LOG-920"
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
                    <span className="form-hint">Standard UoM</span>
                  </label>
                  <select
                    id="prod-uom"
                    className={`input-field ${formErrors.unitOfMeasure ? 'input-invalid' : ''}`}
                    value={formData.unitOfMeasure}
                    onChange={(e) => handleInputChange('unitOfMeasure', e.target.value)}
                  >
                    {DEFAULT_UOMS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                  {formErrors.unitOfMeasure && (
                    <div className="form-error">
                      <AlertCircle size={13} />
                      <span>{formErrors.unitOfMeasure}</span>
                    </div>
                  )}
                </div>

                {/* Initial Stock (or Current Stock when editing) */}
                <div className="form-group">
                  <label htmlFor="prod-stock">
                    <span>
                      {editingProduct ? 'Current Stock' : 'Initial Stock'}{' '}
                      <span className="label-required">*</span>
                    </span>
                    <span className="form-hint">Quantity on hand</span>
                  </label>
                  <input
                    id="prod-stock"
                    type="number"
                    min="0"
                    step="1"
                    required
                    className={`input-field ${formErrors.stock ? 'input-invalid' : ''}`}
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                  />
                  {formErrors.stock && (
                    <div className="form-error">
                      <AlertCircle size={13} />
                      <span>{formErrors.stock}</span>
                    </div>
                  )}
                </div>

                {/* Min Safety Stock */}
                <div className="form-group">
                  <label htmlFor="prod-min-stock">
                    <span>Min Safety Stock</span>
                    <span className="form-hint">Triggers Low Stock</span>
                  </label>
                  <input
                    id="prod-min-stock"
                    type="number"
                    min="0"
                    step="1"
                    className={`input-field ${formErrors.minStock ? 'input-invalid' : ''}`}
                    value={formData.minStock}
                    onChange={(e) => handleInputChange('minStock', e.target.value)}
                  />
                  {formErrors.minStock && (
                    <div className="form-error">
                      <AlertCircle size={13} />
                      <span>{formErrors.minStock}</span>
                    </div>
                  )}
                </div>

                {/* Unit Price */}
                <div className="form-group">
                  <label htmlFor="prod-price">
                    <span>Unit Price ($)</span>
                  </label>
                  <input
                    id="prod-price"
                    type="number"
                    min="0"
                    step="0.01"
                    className={`input-field ${formErrors.unitPrice ? 'input-invalid' : ''}`}
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                  />
                  {formErrors.unitPrice && (
                    <div className="form-error">
                      <AlertCircle size={13} />
                      <span>{formErrors.unitPrice}</span>
                    </div>
                  )}
                </div>

                {/* Storage Location / Bay */}
                <div className="form-group">
                  <label htmlFor="prod-location">
                    <span>Storage Location / Bay</span>
                  </label>
                  <input
                    id="prod-location"
                    type="text"
                    className="input-field"
                    placeholder="e.g. Zone A - Bay 04"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>

                {/* Supplier */}
                <div className="form-group">
                  <label htmlFor="prod-supplier">
                    <span>Primary Supplier</span>
                  </label>
                  <input
                    id="prod-supplier"
                    type="text"
                    className="input-field"
                    placeholder="e.g. ScanTech Global"
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <Button variant="outline" size="md" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {productToDelete && (
        <div className="modal-backdrop" onClick={() => setProductToDelete(null)}>
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
                Delete Product?
              </h3>
              <p className="delete-confirm-text">
                Are you sure you want to delete this inventory item? This will remove it from the active catalog and inventory balances.
                <span className="delete-target-highlight">
                  {productToDelete.name} ({productToDelete.sku})
                </span>
              </p>
              <div className="delete-modal-actions">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setProductToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  icon={Trash2}
                  onClick={handleConfirmDelete}
                >
                  Delete Product
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
