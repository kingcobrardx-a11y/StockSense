import React, { useState } from 'react';
import {
  Package,
  Plus,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  Eye,
  Sliders,
  DollarSign,
  Tag
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import { mockProducts } from '../data/mockData';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    stock: 20,
    minStock: 10,
    unitPrice: 49.99,
    location: 'Zone A - Bay 01',
    supplier: 'FastShip Logistics',
  });

  const categories = ['All', 'Electronics', 'Packaging', 'Warehouse Equipment', 'Safety & PPE'];
  const statuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

  // Filtering logic
  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku) return;

    const created = {
      id: `PRD-${Date.now().toString().slice(-3)}`,
      sku: newProduct.sku.toUpperCase(),
      name: newProduct.name,
      category: newProduct.category,
      stock: Number(newProduct.stock) || 0,
      minStock: Number(newProduct.minStock) || 10,
      maxStock: (Number(newProduct.stock) || 10) * 4,
      unitPrice: Number(newProduct.unitPrice) || 0,
      location: newProduct.location,
      status: Number(newProduct.stock) === 0 ? 'Out of Stock' : Number(newProduct.stock) < Number(newProduct.minStock) ? 'Low Stock' : 'In Stock',
      lastRestocked: new Date().toISOString().split('T')[0],
      supplier: newProduct.supplier,
    };

    setProducts([created, ...products]);
    setShowAddModal(false);
    setNewProduct({
      name: '',
      sku: '',
      category: 'Electronics',
      stock: 20,
      minStock: 10,
      unitPrice: 49.99,
      location: 'Zone A - Bay 01',
      supplier: 'FastShip Logistics',
    });
  };

  const columns = [
    {
      header: 'SKU / ID',
      accessor: 'sku',
      width: '130px',
      render: (row) => (
        <div>
          <span className="font-mono font-medium text-cyan">{row.sku}</span>
          <div className="text-muted text-xs font-mono">{row.id}</div>
        </div>
      ),
    },
    {
      header: 'Product Details',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-semibold text-white">{row.name}</div>
          <div className="product-category-tag">
            <Tag size={12} /> {row.category}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '130px',
      render: (row) => <Badge dot>{row.status}</Badge>,
    },
    {
      header: 'Stock Level',
      accessor: 'stock',
      width: '180px',
      render: (row) => {
        const pct = Math.min((row.stock / (row.maxStock || 100)) * 100, 100);
        return (
          <div className="product-stock-cell">
            <div className="stock-label-row">
              <span className="stock-num text-white">{row.stock}</span>
              <span className="stock-bounds text-muted">/ min {row.minStock}</span>
            </div>
            <div className="stock-level-bar">
              <div
                className={`stock-fill ${
                  row.stock === 0 ? 'fill-danger' : row.stock < row.minStock ? 'fill-warning' : 'fill-success'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Unit Price',
      accessor: 'unitPrice',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-medium text-white">${row.unitPrice.toFixed(2)}</span>
      ),
    },
    {
      header: 'Storage Bay',
      accessor: 'location',
      render: (row) => <span className="badge-pill badge-neutral badge-sm">{row.location}</span>,
    },
    {
      header: 'Supplier',
      accessor: 'supplier',
      render: (row) => <span className="text-secondary text-xs">{row.supplier}</span>,
    },
    {
      header: 'Actions',
      align: 'center',
      render: (row) => (
        <div className="row-actions">
          <button
            type="button"
            className="action-icon-btn"
            title="Adjust Quantity"
            onClick={() => alert(`Adjust stock for: ${row.name}`)}
          >
            <Sliders size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="products-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Package size={24} className="text-cyan" />
            <span>Product Master Catalog</span>
          </h1>
          <p>Global item registry, real-time balances, reorder points, and bay locations.</p>
        </div>

        <div className="page-actions">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Add New SKU
          </Button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="products-kpi-bar">
        <div className="kpi-mini">
          <span className="kpi-mini-title">Showing SKUs</span>
          <span className="kpi-mini-val text-white">{filteredProducts.length} of {products.length}</span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">In Stock</span>
          <span className="kpi-mini-val text-emerald">
            {products.filter((p) => p.status === 'In Stock').length}
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Low Stock</span>
          <span className="kpi-mini-val text-amber">
            {products.filter((p) => p.status === 'Low Stock').length}
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Out of Stock</span>
          <span className="kpi-mini-val text-rose">
            {products.filter((p) => p.status === 'Out of Stock').length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="products-controls-bar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by product name, SKU, bay, or supplier..."
        />

        {/* Category Pills */}
        <div className="filter-pill-group">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-pill ${selectedCategory === cat ? 'filter-pill-active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Dropdown */}
        <div className="status-filter-select-wrap">
          <select
            className="input-field select-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        emptyMessage="No products found matching your active filters."
      />

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Inventory Item</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Ergonomic Hand Scanner"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>SKU Code *</label>
                  <input
                    type="text"
                    required
                    className="input-field font-mono"
                    placeholder="e.g. SKU-LOG-990"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="input-field"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Warehouse Equipment">Warehouse Equipment</option>
                    <option value="Safety & PPE">Safety & PPE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Storage Location / Bay</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Zone A - Bay 05"
                    value={newProduct.location}
                    onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Initial Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Min Safety Stock</label>
                  <input
                    type="number"
                    min="1"
                    className="input-field"
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-field"
                    value={newProduct.unitPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, unitPrice: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Supplier Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={newProduct.supplier}
                    onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit">
                  Save Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
