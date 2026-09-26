import React, { useState, useEffect } from 'react';
import {
  ArrowDownToLine,
  Plus,
  CheckCircle2,
  Clock,
  Truck,
  Building,
  FileCheck,
  Search
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Toast from '../components/Toast';
import { mockReceipts } from '../data/mockData';
import { createReceipt, fetchProducts, fetchWarehouses } from '../services/api';

export default function Receipts() {
  const [receipts, setReceipts] = useState(mockReceipts);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form fields
  const [productId, setProductId] = useState('1');
  const [warehouseId, setWarehouseId] = useState('1');
  const [quantity, setQuantity] = useState('50');
  const [reference, setReference] = useState('');

  // Dropdown options
  const [productsList, setProductsList] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);

  useEffect(() => {
    fetchProducts().then((data) => setProductsList(data || []));
    fetchWarehouses().then((data) => setWarehousesList(data || []));
  }, []);

  const filtered = receipts.filter((r) => {
    const matchSearch =
      r.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.supplier.toLowerCase().includes(search.toLowerCase()) ||
      (r.trackingNumber && r.trackingNumber.toLowerCase().includes(search.toLowerCase())) ||
      r.warehouse.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleQuickReceive = (id) => {
    setReceipts((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'Received', receivedCount: item.itemsCount }
          : item
      )
    );
    setToast({ type: 'success', message: 'Inbound PO verified and received into inventory.' });
  };

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      setToast({ type: 'error', message: 'Quantity must be greater than 0' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createReceipt({
        product_id: parseInt(productId, 10),
        warehouse_id: parseInt(warehouseId, 10),
        quantity: qty,
        reference: reference.trim() || `PO-${Date.now().toString().slice(-4)}`,
      });

      const selectedProd = productsList.find((p) => p.id === parseInt(productId, 10));
      const selectedWh = warehousesList.find((w) => w.id === parseInt(warehouseId, 10));

      const newReceiptItem = {
        id: `REC-${Date.now().toString().slice(-4)}`,
        poNumber: reference.trim() || `PO-2026-${Date.now().toString().slice(-3)}`,
        supplier: selectedProd ? `Supplier (${selectedProd.name})` : 'Supplier Direct',
        warehouse: selectedWh ? selectedWh.name : 'Main Warehouse',
        itemsCount: qty,
        receivedCount: qty,
        expectedDate: new Date().toISOString().split('T')[0],
        totalValue: `$${(qty * 45).toLocaleString()}`,
        status: 'Received',
        trackingNumber: `TRK-${Date.now().toString().slice(-6)}`,
      };

      setReceipts([newReceiptItem, ...receipts]);
      setShowModal(false);
      setReference('');
      setToast({
        type: 'success',
        message: res.message || `Successfully recorded receipt of ${qty} units!`,
      });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to record receipt' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'PO / Receipt ID',
      accessor: 'poNumber',
      width: '160px',
      render: (row) => (
        <div>
          <span className="font-mono font-semibold text-cyan">{row.poNumber}</span>
          <div className="text-muted text-xs font-mono">{row.id}</div>
        </div>
      ),
    },
    {
      header: 'Supplier',
      accessor: 'supplier',
      render: (row) => (
        <div>
          <span className="font-medium text-white">{row.supplier}</span>
          <div className="text-muted text-xs font-mono">{row.trackingNumber}</div>
        </div>
      ),
    },
    {
      header: 'Destination Hub',
      accessor: 'warehouse',
      render: (row) => <span className="text-secondary text-xs">{row.warehouse}</span>,
    },
    {
      header: 'Inbound Progress',
      accessor: 'receivedCount',
      width: '180px',
      render: (row) => {
        const pct = Math.round((row.receivedCount / row.itemsCount) * 100);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
              <span className="text-white font-mono">{row.receivedCount} / {row.itemsCount} units</span>
              <span className="text-muted font-mono">{pct}%</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: pct === 100 ? '#10b981' : pct > 0 ? '#f59e0b' : '#3b82f6',
                  borderRadius: '99px',
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Expected Arrival',
      accessor: 'expectedDate',
      render: (row) => <span className="font-mono text-secondary text-xs">{row.expectedDate}</span>,
    },
    {
      header: 'Total Value',
      accessor: 'totalValue',
      align: 'right',
      render: (row) => <span className="font-mono font-medium text-white">{row.totalValue}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '120px',
      render: (row) => <Badge dot>{row.status}</Badge>,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {row.status !== 'Received' ? (
            <Button
              variant="success"
              size="sm"
              icon={CheckCircle2}
              onClick={() => handleQuickReceive(row.id)}
            >
              Verify & Receive
            </Button>
          ) : (
            <span className="badge-pill badge-neutral badge-sm font-mono">Stocked ✓</span>
          )}
        </div>
      ),
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
            <ArrowDownToLine size={24} className="text-amber" />
            <span>Inbound Receipts & PO Logistics</span>
          </h1>
          <p>Inspect incoming freight, register supplier receipts, and clear goods into storage bays.</p>
        </div>

        <div className="page-actions">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setShowModal(true)}
          >
            Create Inbound PO
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="products-kpi-bar">
        <div className="kpi-mini">
          <span className="kpi-mini-title">Active PO Receipts</span>
          <span className="kpi-mini-val text-white">{receipts.length}</span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Awaiting Dock</span>
          <span className="kpi-mini-val text-amber">
            {receipts.filter((r) => r.status === 'Pending').length}
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Partial Received</span>
          <span className="kpi-mini-val text-blue">
            {receipts.filter((r) => r.status === 'Partial').length}
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Verified & Stocked</span>
          <span className="kpi-mini-val text-emerald">
            {receipts.filter((r) => r.status === 'Received').length}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="products-controls-bar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter by PO #, supplier, or tracking number..."
        />

        <div className="filter-pill-group">
          {['All', 'Pending', 'Partial', 'Received'].map((st) => (
            <button
              key={st}
              type="button"
              className={`filter-pill ${statusFilter === st ? 'filter-pill-active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No inbound receipts match the current query."
      />

      {/* New Inbound Receipt Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Inbound Stock Receipt"
        subtitle="Record newly received inventory into target warehouse storage"
      >
        <form onSubmit={handleCreateReceipt}>
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
            label="Destination Warehouse *"
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
            label="Receipt Quantity *"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <Input
            label="PO / Invoice Reference"
            placeholder="e.g. PO-2026-009"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Confirm Receipt
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
