import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  PackageCheck,
  Clock,
  Printer,
  Calendar,
  AlertCircle
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Toast from '../components/Toast';
import { mockDeliveries } from '../data/mockData';
import { createDelivery, fetchProducts, fetchWarehouses } from '../services/api';

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState(mockDeliveries);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form fields
  const [productId, setProductId] = useState('1');
  const [warehouseId, setWarehouseId] = useState('1');
  const [quantity, setQuantity] = useState('10');
  const [reference, setReference] = useState('');

  // Dropdown data
  const [productsList, setProductsList] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);

  useEffect(() => {
    fetchProducts().then((data) => setProductsList(data || []));
    fetchWarehouses().then((data) => setWarehousesList(data || []));
  }, []);

  const filtered = deliveries.filter((d) => {
    const matchSearch =
      d.doNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.customer.toLowerCase().includes(search.toLowerCase()) ||
      d.carrier.toLowerCase().includes(search.toLowerCase()) ||
      d.destination.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDispatch = (id) => {
    setDeliveries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'In Transit' } : item
      )
    );
    setToast({ type: 'info', message: 'Delivery dispatched into carrier transit.' });
  };

  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      setToast({ type: 'error', message: 'Quantity must be greater than 0' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createDelivery({
        product_id: parseInt(productId, 10),
        warehouse_id: parseInt(warehouseId, 10),
        quantity: qty,
        reference: reference.trim() || `DO-${Date.now().toString().slice(-4)}`,
      });

      const selectedProd = productsList.find((p) => p.id === parseInt(productId, 10));
      const selectedWh = warehousesList.find((w) => w.id === parseInt(warehouseId, 10));

      const newDeliveryItem = {
        id: `DEL-${Date.now().toString().slice(-4)}`,
        doNumber: reference.trim() || `DO-2026-${Date.now().toString().slice(-3)}`,
        customer: selectedProd ? `Client Order (${selectedProd.name})` : 'Distribution Client',
        destination: selectedWh ? `${selectedWh.name} Region` : 'Northern Fulfillment Center',
        itemsCount: qty,
        carrier: 'FastTrack Logistics',
        trackingNumber: `FT-${Date.now().toString().slice(-6)}`,
        departureDate: new Date().toISOString().split('T')[0],
        status: 'Ready to Ship',
      };

      setDeliveries([newDeliveryItem, ...deliveries]);
      setShowModal(false);
      setReference('');
      setToast({
        type: 'success',
        message: res.message || `Successfully created delivery order for ${qty} units!`,
      });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Insufficient stock or delivery failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'DO Number / ID',
      accessor: 'doNumber',
      width: '160px',
      render: (row) => (
        <div>
          <span className="font-mono font-semibold text-cyan">{row.doNumber}</span>
          <div className="text-muted text-xs font-mono">{row.id}</div>
        </div>
      ),
    },
    {
      header: 'Customer / Recipient',
      accessor: 'customer',
      render: (row) => (
        <div>
          <span className="font-medium text-white">{row.customer}</span>
          <div className="text-muted text-xs">{row.destination}</div>
        </div>
      ),
    },
    {
      header: 'Volume',
      accessor: 'itemsCount',
      align: 'right',
      render: (row) => <span className="font-mono font-medium text-white">{row.itemsCount} units</span>,
    },
    {
      header: 'Carrier & Tracking',
      accessor: 'carrier',
      render: (row) => (
        <div>
          <span className="text-secondary text-xs">{row.carrier}</span>
          <div className="font-mono text-muted text-xs">{row.trackingNumber}</div>
        </div>
      ),
    },
    {
      header: 'Departure',
      accessor: 'departureDate',
      render: (row) => <span className="font-mono text-secondary text-xs">{row.departureDate}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '130px',
      render: (row) => {
        let variant = 'info';
        if (row.status === 'Delivered') variant = 'success';
        if (row.status === 'Ready to Ship') variant = 'cyan';
        if (row.status === 'Packing') variant = 'warning';
        return <Badge variant={variant} dot>{row.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {row.status === 'Ready to Ship' ? (
            <Button
              variant="primary"
              size="sm"
              icon={Truck}
              onClick={() => handleDispatch(row.id)}
            >
              Dispatch
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={() => setToast({ type: 'info', message: `Packing slip ready for ${row.doNumber}` })}
            >
              Slip
            </Button>
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
            <Truck size={24} className="text-blue" />
            <span>Outbound Delivery Orders (DO)</span>
          </h1>
          <p>Pick, pack, verify manifests, and dispatch outbound stock to distribution hubs.</p>
        </div>

        <div className="page-actions">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setShowModal(true)}
          >
            Create Delivery Order
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="products-kpi-bar">
        <div className="kpi-mini">
          <span className="kpi-mini-title">Total Orders</span>
          <span className="kpi-mini-val text-white">{deliveries.length}</span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Ready to Ship</span>
          <span className="kpi-mini-val text-cyan">
            {deliveries.filter((d) => d.status === 'Ready to Ship').length}
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">In Transit</span>
          <span className="kpi-mini-val text-blue">
            {deliveries.filter((d) => d.status === 'In Transit').length}
          </span>
        </div>
        <div className="kpi-mini">
          <span className="kpi-mini-title">Delivered Today</span>
          <span className="kpi-mini-val text-emerald">
            {deliveries.filter((d) => d.status === 'Delivered').length}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="products-controls-bar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter by DO #, customer, or destination..."
        />

        <div className="filter-pill-group">
          {['All', 'Ready to Ship', 'In Transit', 'Delivered'].map((st) => (
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
        emptyMessage="No delivery orders found matching the filter criteria."
      />

      {/* Create Delivery Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Outbound Delivery Order"
        subtitle="Deduct verified items from warehouse stock and generate dispatch manifest"
      >
        <form onSubmit={handleCreateDelivery}>
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
            label="Fulfillment Warehouse *"
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
            label="Delivery Quantity *"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <Input
            label="Delivery Order (DO) Reference"
            placeholder="e.g. DO-2026-004"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Confirm Delivery
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
