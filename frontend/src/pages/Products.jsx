import React, { useState, useEffect } from 'react';
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
  Tag,
  RefreshCw
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import Toast from '../components/Toast';
import { mockProducts } from '../data/mockData';
import { fetchProducts, createProduct } from '../services/api';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    unit: 'pcs',
    reorder_level: 20,
    stock: 20,
    location: 'Zone A - Bay 01',
    supplier: 'FastShip Logistics',
  });

  const categories = ['All', 'Raw Material', 'Electronics', 'Packaging', 'Warehouse Equipment', 'Safety & PPE'];
  const statuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

  // Load from API on mount
  useEffect(() => {
    fetchProducts()
      .then((data) => {
        if (data && data.length > 0) {
          // If backend returns list of products, normalize to table format
          const formatted = data.map((p) => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            category: p.category || 'General',
            stock: p.stock || 50,
            minStock: p.reorder_level || p.minStock || 15,
            maxStock: (p.reorder_level || 20) * 4,
            unitPrice: p.unitPrice || 49.99,
            location: p.location || 'Zone A - Bay 01',
            status: p.status || (p.stock === 0 ? 'Out of Stock' : (p.stock <= (p.reorder_level || 15) ? 'Low Stock' : 'In Stock')),
            lastRestocked: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '2026-03-20',
            supplier: p.supplier || 'FastShip Logistics',
          }));
          setProducts(formatted);
        }
      })
      .catch(() => {});
  }, []);

  // Filtering logic
  const filteredProducts = products.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.supplier && item.supplier.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku) {
      setToast({ type: 'error', message: 'Product Name and SKU are required' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Call backend API
      let backendId = Date.now().toString().slice(-3);
      try {
        const createdApi = await createProduct({
          name: newProduct.name,
          sku: newProduct.sku.toUpperCase(),
          category: newProduct.category,
          unit: newProduct.unit || 'pcs',
          reorder_level: Number(newProduct.reorder_level) || 20,
        });
        if (createdApi && createdApi.id) {
          backendId = createdApi.id;
        }
      } catch (apiErr) {
        console.warn('API creation failed, adding to local state:', apiErr.message);
      }

      const created = {
        id: backendId,
        sku: newProduct.sku.toUpperCase(),
        name: newProduct.name,
        category: newProduct.category,
        stock: Number(newProduct.stock) || 0,
        minStock: Number(newProduct.reorder_level) || 10,
        maxStock: (Number(newProduct.stock) || 10) * 4,
        unitPrice: 49.99,
        location: newProduct.location || 'Zone A - Bay 01',
        status: Number(newProduct.stock) === 0 ? 'Out of Stock' : Number(newProduct.stock) < Number(newProduct.reorder_level) ? 'Low Stock' : 'In Stock',
        lastRestocked: new Date().toISOString().split('T')[0],
        supplier: newProduct.supplier || 'Direct Factory',
      };

      setProducts([created, ...products]);
      setShowAddModal(false);
      setNewProduct({
        name: '',
        sku: '',
        category: 'Electronics',
        unit: 'pcs',
        reorder_level: 20,
        stock: 20,
        location: 'Zone A - Bay 01',
        supplier: 'FastShip Logistics',
      });
      setToast({ type: 'success', message: 'Product created successfully!' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to create product' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Product',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-semibold text-white">{row.name}</div>
          <div className="text-secondary text-xs">{row.location}</div>
        </div>
      ),
    },
    {
      header: 'SKU',
      accessor: 'sku',
      render: (row) => (
        <span className="font-mono font-medium text-cyan">{row.sku}</span>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <span className="badge-pill badge-neutral badge-sm">{row.category}</span>
      ),
    },
    {
      header: 'Stock Level',
      accessor: 'stock',
      render: (row) => (
        <div>
          <div className="font-mono font-bold text-white">{row.stock} units</div>
          <div className="text-muted text-xs font-mono">Min: {row.minStock}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '130px',
      render: (row) => {
        let variant = 'info';
        if (row.status === 'In Stock') variant = 'success';
        if (row.status === 'Low Stock') variant = 'warning';
        if (row.status === 'Out of Stock') variant = 'danger';
        return <Badge variant={variant} dot>{row.status}</Badge>;
      },
    },
  ];

  return (
    <div className="products-page">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Package size={24} className="text-cyan" />
            <span>Products Catalog</span>
          </h1>
          <p>Centralized product registry with stock thresholds, SKU routing, and unit counts.</p>
        </div>

        <div className="page-actions">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Controls Bar: Search & Category Filters */}
      <div className="products-controls-bar">
        <SearchBar
          value={searchQuery}
          onChange={(val) => setSearchQuery(typeof val === 'string' ? val : val.target.value)}
          placeholder="Search products by name, SKU, or bay..."
        />

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
              <h3>Add Product</h3>
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
                    placeholder="e.g. Steel Rods"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    required
                    className="input-field font-mono"
                    placeholder="e.g. STL001"
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
                    <option value="Raw Material">Raw Material</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Warehouse Equipment">Warehouse Equipment</option>
                    <option value="Safety & PPE">Safety & PPE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Unit</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. kg, pcs, box"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    placeholder="e.g. 20"
                    value={newProduct.reorder_level}
                    onChange={(e) => setNewProduct({ ...newProduct, reorder_level: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    placeholder="e.g. 50"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
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
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  isLoading={isSubmitting}
                >
                  Create Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
