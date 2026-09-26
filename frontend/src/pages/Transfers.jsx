import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Toast from '../components/Toast';
import { mockTransfers } from '../data/mockData';
import { createTransfer, fetchProducts, fetchWarehouses } from '../services/api';

export default function Transfers() {
  const [transfers, setTransfers] = useState(mockTransfers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form fields
  const [productId, setProductId] = useState('1');
  const [sourceWhId, setSourceWhId] = useState('1');
  const [destWhId, setDestWhId] = useState('2');
  const [quantity, setQuantity] = useState('15');
  const [reference, setReference] = useState('');

  // Dropdown data
  const [productsList, setProductsList] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);

  useEffect(() => {
    fetchProducts().then((data) => setProductsList(data || []));
    fetchWarehouses().then((data) => setWarehousesList(data || []));
  }, []);

  const filtered = transfers.filter((t) => {
    const matchSearch =
      t.transferId.toLowerCase().includes(search.toLowerCase()) ||
      t.item.toLowerCase().includes(search.toLowerCase()) ||
      t.fromLocation.toLowerCase().includes(search.toLowerCase()) ||
      t.toLocation.toLowerCase().includes(search.toLowerCase()) ||
      t.reason.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCompleteTransfer = (id) => {
    setTransfers((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'Completed' } : item
      )
    );
    setToast({ type: 'success', message: 'Transfer marked as completed in destination hub.' });
  };

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    if (sourceWhId === destWhId) {
      setToast({ type: 'error', message: 'Source and destination warehouses must be different.' });
      return;
    }

    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      setToast({ type: 'error', message: 'Quantity must be greater than 0' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createTransfer({
        product_id: parseInt(productId, 10),
        source_warehouse_id: parseInt(sourceWhId, 10),
        destination_warehouse_id: parseInt(destWhId, 10),
        quantity: qty,
        reference: reference.trim() || `TR-${Date.now().toString().slice(-4)}`,
      });

      const selectedProd = productsList.find((p) => p.id === parseInt(productId, 10));
      const sourceWh = warehousesList.find((w) => w.id === parseInt(sourceWhId, 10));
      const destWh = warehousesList.find((w) => w.id === parseInt(destWhId, 10));

      const newTransferItem = {
        id: `TRF-${Date.now().toString().slice(-4)}`,
        transferId: reference.trim() || `TR-2026-${Date.now().toString().slice(-3)}`,
        fromLocation: sourceWh ? sourceWh.name : `Warehouse #${sourceWhId}`,
        toLocation: destWh ? destWh.name : `Warehouse #${destWhId}`,
        item: selectedProd ? selectedProd.name : 'Steel Rods',
        qty: `${qty} units`,
        initiatedBy: 'Admin Dispatcher',
        reason: 'Inter-facility balance re-allocation',
        time: 'Just now',
        status: 'In Transit',
      };

      setTransfers([newTransferItem, ...transfers]);
      setShowModal(false);
      setReference('');
      setToast({
        type: 'success',
        message: res.message || `Successfully transferred ${qty} units!`,
      });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Transfer failed. Check source stock.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Transfer ID',
      accessor: 'transferId',
      width: '150px',
      render: (row) => (
        <div>
          <span className="font-mono font-semibold text-cyan">{row.transferId}</span>
          <div className="text-muted text-xs font-mono">{row.id}</div>
        </div>
      ),
    },
    {
      header: 'Source & Destination Route',
      accessor: 'fromLocation',
      width: '280px',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-medium text-white text-xs">{row.fromLocation}</span>
          <ArrowRight size={13} className="text-muted" />
          <span className="font-medium text-emerald text-xs">{row.toLocation}</span>
        </div>
      ),
    },
    {
      header: 'Transferred Item',
      accessor: 'item',
      render: (row) => (
        <div>
          <span className="font-medium text-white">{row.item}</span>
          <div className="text-muted text-xs">{row.reason}</div>
        </div>
      ),
    },
    {
      header: 'Volume',
      accessor: 'qty',
      align: 'right',
      render: (row) => <span className="font-mono font-medium text-white">{row.qty}</span>,
    },
    {
      header: 'Operator & Time',
      accessor: 'initiatedBy',
      render: (row) => (
        <div>
          <span className="text-secondary text-xs">{row.initiatedBy}</span>
          <div className="text-muted text-xs">{row.time}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '120px',
      render: (row) => {
        let variant = 'info';
        if (row.status === 'Completed') variant = 'success';
        if (row.status === 'In Transit') variant = 'purple';
        if (row.status === 'Scheduled') variant = 'warning';
        return <Badge variant={variant} dot>{row.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {row.status !== 'Completed' ? (
            <Button
              variant="success"
              size="sm"
              icon={CheckCircle2}
              onClick={() => handleCompleteTransfer(row.id)}
            >
              Complete
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
            <ArrowLeftRight size={24} className="text-purple" />
            <span>Internal Warehouse Transfers</span>
          </h1>
          <p>Relocate stock across high-rack bays, pick stations, and regional sister distribution hubs.</p>
        </div>

        <div className="page-actions">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setShowModal(true)}
          >
            Initiate Transfer
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="products-kpi-bar">
        <div className="kpi-mini">
          <span className="kpi-mini-title">Total Active Moves</span>
          <span className="kpi-mini-val text-white">{transfers.length}</span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">In Transit</span>
          <span className="kpi-mini-val text-cyan">
            {transfers.filter((t) => t.status === 'In Transit').length}
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Scheduled</span>
          <span className="kpi-mini-val text-amber">
            {transfers.filter((t) => t.status === 'Scheduled').length}
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Completed Today</span>
          <span className="kpi-mini-val text-emerald">
            {transfers.filter((t) => t.status === 'Completed').length}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="products-controls-bar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter by transfer ID, item, or hub location..."
        />

        <div className="filter-pill-group">
          {['All', 'In Transit', 'Scheduled', 'Completed'].map((st) => (
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
        emptyMessage="No internal transfers found matching the filter criteria."
      />

      {/* Initiate Transfer Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Initiate Internal Stock Transfer"
        subtitle="Move verified inventory balance between distinct facility warehouses"
      >
        <form onSubmit={handleCreateTransfer}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Select
              label="Source Warehouse *"
              value={sourceWhId}
              onChange={(e) => setSourceWhId(e.target.value)}
              options={
                warehousesList.length > 0
                  ? warehousesList.map((w) => ({ value: w.id, label: `${w.name} (#${w.id})` }))
                  : [
                      { value: 1, label: 'Main Warehouse (#1)' },
                      { value: 2, label: 'Production Unit (#2)' },
                    ]
              }
              required
            />

            <Select
              label="Destination Warehouse *"
              value={destWhId}
              onChange={(e) => setDestWhId(e.target.value)}
              options={
                warehousesList.length > 0
                  ? warehousesList.map((w) => ({ value: w.id, label: `${w.name} (#${w.id})` }))
                  : [
                      { value: 1, label: 'Main Warehouse (#1)' },
                      { value: 2, label: 'Production Unit (#2)' },
                    ]
              }
              required
            />
          </div>

          <Input
            label="Transfer Quantity *"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <Input
            label="Transfer Order Reference"
            placeholder="e.g. TR-2026-008"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Execute Transfer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
