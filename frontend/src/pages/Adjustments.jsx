import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Scale,
  Clock,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Toast from '../components/Toast';
import { mockAdjustments } from '../data/mockData';
import { createAdjustment, fetchProducts, fetchWarehouses } from '../services/api';

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState(mockAdjustments);
  const [search, setSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form fields
  const [productId, setProductId] = useState('1');
  const [warehouseId, setWarehouseId] = useState('1');
  const [quantity, setQuantity] = useState('-3');
  const [reference, setReference] = useState('');

  // Dropdown data
  const [productsList, setProductsList] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);

  useEffect(() => {
    fetchProducts().then((data) => setProductsList(data || []));
    fetchWarehouses().then((data) => setWarehousesList(data || []));
  }, []);

  const filtered = adjustments.filter((a) => {
    const matchSearch =
      a.adjNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.productName.toLowerCase().includes(search.toLowerCase()) ||
      a.sku.toLowerCase().includes(search.toLowerCase()) ||
      a.warehouse.toLowerCase().includes(search.toLowerCase()) ||
      a.reason.toLowerCase().includes(search.toLowerCase());
    const matchReason = reasonFilter === 'All' || a.reason === reasonFilter;
    return matchSearch && matchReason;
  });

  const handleCreateAdjustment = async (e) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (!qty || qty === 0) {
      setToast({ type: 'error', message: 'Adjustment quantity cannot be zero.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAdjustment({
        product_id: parseInt(productId, 10),
        warehouse_id: parseInt(warehouseId, 10),
        quantity: qty,
        reference: reference.trim() || `ADJ-${Date.now().toString().slice(-4)}`,
      });

      const selectedProd = productsList.find((p) => p.id === parseInt(productId, 10));
      const selectedWh = warehousesList.find((w) => w.id === parseInt(warehouseId, 10));

      const newAdjItem = {
        id: `ADJ-${Date.now().toString().slice(-4)}`,
        adjNumber: reference.trim() || `ADJ-2026-${Date.now().toString().slice(-3)}`,
        productName: selectedProd ? selectedProd.name : 'Steel Rods',
        sku: selectedProd ? selectedProd.sku : 'STL001',
        warehouse: selectedWh ? selectedWh.name : 'Main Warehouse',
        previousStock: 30,
        adjustedQty: qty > 0 ? `+${qty}` : `${qty}`,
        newStock: Math.max(0, 30 + qty),
        reason: qty > 0 ? 'Surplus / Return Reconciled' : 'Damage / Spoilage Written Off',
        auditor: 'Admin Auditor',
        status: 'Approved',
        date: new Date().toISOString().split('T')[0],
      };

      setAdjustments([newAdjItem, ...adjustments]);
      setShowModal(false);
      setReference('');
      setToast({
        type: 'success',
        message: res.message || `Successfully adjusted stock by ${qty > 0 ? `+${qty}` : qty} units!`,
      });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Adjustment failed. Stock cannot become negative.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Adjustment ID',
      accessor: 'adjNumber',
      width: '150px',
      render: (row) => (
        <div>
          <span className="font-mono font-semibold text-cyan">{row.adjNumber}</span>
          <div className="text-muted text-xs font-mono">{row.id}</div>
        </div>
      ),
    },
    {
      header: 'Product Item',
      accessor: 'productName',
      render: (row) => (
        <div>
          <span className="font-medium text-white">{row.productName}</span>
          <div className="text-muted text-xs font-mono">{row.sku}</div>
        </div>
      ),
    },
    {
      header: 'Facility Hub',
      accessor: 'warehouse',
      render: (row) => <span className="text-secondary text-xs">{row.warehouse}</span>,
    },
    {
      header: 'Variance Delta',
      accessor: 'adjustedQty',
      align: 'right',
      render: (row) => {
        const isPos = String(row.adjustedQty).startsWith('+');
        return (
          <span
            className={`font-mono font-semibold ${
              isPos ? 'text-emerald' : 'text-rose'
            }`}
          >
            {row.adjustedQty}
          </span>
        );
      },
    },
    {
      header: 'Audit Reason',
      accessor: 'reason',
      render: (row) => <span className="text-secondary text-xs">{row.reason}</span>,
    },
    {
      header: 'Auditor & Date',
      accessor: 'auditor',
      render: (row) => (
        <div>
          <span className="text-secondary text-xs">{row.auditor}</span>
          <div className="text-muted text-xs">{row.date}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '120px',
      render: (row) => <Badge variant="success" dot>{row.status}</Badge>,
    },
  ];

  return (
    <div className="operations-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <SlidersHorizontal size={24} className="text-rose" />
            <span>Stock Reconciliation & Adjustments</span>
          </h1>
          <p>Authorize physical count variance corrections, scrap write-offs, and batch reconcile tickets.</p>
        </div>

        <div className="page-actions">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setShowModal(true)}
          >
            New Adjustment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="products-kpi-bar">
        <div className="kpi-mini">
          <span className="kpi-mini-title">Total Audit Logs</span>
          <span className="kpi-mini-val text-white">{adjustments.length}</span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Net Shrinkage Delta</span>
          <span className="kpi-mini-val text-rose">-14 units</span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Cycle Count Surplus</span>
          <span className="kpi-mini-val text-emerald">+25 units</span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Approved Variance</span>
          <span className="kpi-mini-val text-cyan">100% Verified</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="products-controls-bar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter by adjustment #, SKU, or audit reason..."
        />

        <div className="filter-pill-group">
          {['All', 'Cycle Count Variance', 'Damage in Storage', 'Surplus from Unrecorded Return'].map((r) => (
            <button
              key={r}
              type="button"
              className={`filter-pill ${reasonFilter === r ? 'filter-pill-active' : ''}`}
              onClick={() => setReasonFilter(r)}
            >
              {r.length > 20 ? `${r.slice(0, 18)}...` : r}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No stock adjustment logs match the current query."
      />

      {/* New Adjustment Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Record Stock Adjustment"
        subtitle="Apply physical count delta (+/- units) with audit ledger justification"
      >
        <form onSubmit={handleCreateAdjustment}>
          <Select
            label="Product Item *"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            options={
              productsList.length > 0
                ? productsList.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))
                : [{ value: 1, label: 'Steel Rods (STL001)' }]
            }
            required
          />

          <Select
            label="Target Warehouse *"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            options={
              warehousesList.length > 0
                ? warehousesList.map((w) => ({ value: w.id, label: `${w.name} (#${w.id})` }))
                : [{ value: 1, label: 'Main Warehouse (#1)' }]
            }
            required
          />

          <Input
            label="Adjustment Delta Quantity (+ or -) *"
            type="number"
            placeholder="e.g. -3 for loss, +5 for surplus"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            helperText="Enter a positive number for surplus, or negative for shrinkage/damage."
            required
          />

          <Input
            label="Audit Reference / Justification"
            placeholder="e.g. ADJ-CYCLE-01 or Damaged in transit"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Apply Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
