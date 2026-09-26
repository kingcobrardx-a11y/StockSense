import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';

const TRANSACTION_TYPES = [
  { value: 'RECEIPT', label: 'Receipt (Incoming Supplier Stock)' },
  { value: 'DELIVERY', label: 'Delivery (Outgoing Customer Dispatch)' },
  { value: 'TRANSFER', label: 'Transfer (Inter-Warehouse Relocation)' },
  { value: 'ADJUSTMENT', label: 'Adjustment (Audit / Count Correction)' },
];

export function TransactionModal({
  isOpen,
  onClose,
  defaultType = 'RECEIPT',
  lockType = false,
  preselectedProductId = null,
  preselectedWarehouseId = null,
  products = [],
  warehouses = [],
  stockList = [],
  onSuccess,
}) {
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    type: defaultType,
    product_id: preselectedProductId || '',
    warehouse_id: preselectedWarehouseId || '',
    destination_warehouse_id: '',
    quantity: '',
    reference: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: defaultType,
        product_id: preselectedProductId || (products[0] ? String(products[0].id) : ''),
        warehouse_id: preselectedWarehouseId || (warehouses[0] ? String(warehouses[0].id) : ''),
        destination_warehouse_id:
          warehouses.length > 1
            ? String(warehouses.find((w) => String(w.id) !== String(warehouses[0]?.id))?.id || '')
            : '',
        quantity: '',
        reference: '',
      });
      setErrors({});
    }
  }, [isOpen, defaultType, preselectedProductId, preselectedWarehouseId, products, warehouses]);

  // Find current stock on hand for selected product and warehouse
  const currentStockEntry = stockList.find(
    (s) =>
      String(s.product_id) === String(formData.product_id) &&
      String(s.warehouse_id) === String(formData.warehouse_id)
  );
  const currentQuantity = currentStockEntry ? currentStockEntry.quantity : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.product_id) errs.product_id = 'Product selection is required';
    if (!formData.warehouse_id) errs.warehouse_id = 'Warehouse is required';

    const qty = Number(formData.quantity);
    if (!formData.quantity || isNaN(qty) || qty <= 0) {
      errs.quantity = 'Quantity must be a positive number greater than 0';
    }

    if (formData.type === 'TRANSFER') {
      if (!formData.destination_warehouse_id) {
        errs.destination_warehouse_id = 'Destination warehouse is required for transfers';
      } else if (String(formData.warehouse_id) === String(formData.destination_warehouse_id)) {
        errs.destination_warehouse_id = 'Source and destination warehouses cannot be the same';
      }
    }

    if ((formData.type === 'DELIVERY' || formData.type === 'TRANSFER') && qty > currentQuantity) {
      errs.quantity = `Insufficient stock: only ${currentQuantity} available in selected warehouse`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        product_id: Number(formData.product_id),
        warehouse_id: Number(formData.warehouse_id),
        type: formData.type,
        quantity: Number(formData.quantity),
        reference: formData.reference?.trim() || undefined,
      };

      if (formData.type === 'TRANSFER') {
        payload.source_warehouse_id = Number(formData.warehouse_id);
        payload.destination_warehouse_id = Number(formData.destination_warehouse_id);
      }

      const txResult = await api.createTransaction(payload);

      const typeLabels = {
        RECEIPT: 'Stock Receipt recorded',
        DELIVERY: 'Outgoing Delivery recorded',
        TRANSFER: 'Stock Transfer processed',
        ADJUSTMENT: 'Inventory Adjustment applied',
      };

      success(
        `${typeLabels[formData.type] || 'Transaction recorded'} successfully (Ref: ${
          txResult.reference || `#${txResult.id}`
        }).`
      );

      if (onSuccess) onSuccess(txResult);
      onClose();
    } catch (err) {
      toastError(err.message || 'Failed to record transaction.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => String(p.id) === String(formData.product_id));

  const modalTitles = {
    RECEIPT: 'Record Stock Receipt',
    DELIVERY: 'Create Outgoing Delivery',
    TRANSFER: 'Initiate Stock Transfer',
    ADJUSTMENT: 'Record Stock Adjustment',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitles[formData.type] || 'Record Inventory Transaction'}
      description="Update stock levels and log an immutable entry into the Stock Ledger."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            icon={
              formData.type === 'RECEIPT'
                ? 'arrow-down-left'
                : formData.type === 'DELIVERY'
                ? 'arrow-up-right'
                : formData.type === 'TRANSFER'
                ? 'repeat'
                : 'sliders'
            }
          >
            Confirm & Save
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="form-stack">
        {/* Transaction Type Selector (if not locked) */}
        {!lockType ? (
          <Select
            label="Transaction Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={TRANSACTION_TYPES}
            required
          />
        ) : (
          <div className="form-group">
            <span className="form-label">Movement Type</span>
            <div>
              <Badge variant={formData.type.toLowerCase()} size="md" dot>
                {formData.type}
              </Badge>
            </div>
          </div>
        )}

        {/* Product Selector */}
        <Select
          label="Product"
          name="product_id"
          value={formData.product_id}
          onChange={handleChange}
          error={errors.product_id}
          required
        >
          <option value="">-- Choose Product --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (SKU: {p.sku})
            </option>
          ))}
        </Select>

        {/* Source Warehouse */}
        <div className="form-row-2">
          <Select
            label={formData.type === 'TRANSFER' ? 'Source Warehouse' : 'Warehouse'}
            name="warehouse_id"
            value={formData.warehouse_id}
            onChange={handleChange}
            error={errors.warehouse_id}
            required
          >
            <option value="">-- Choose Warehouse --</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} {w.location ? `(${w.location})` : ''}
              </option>
            ))}
          </Select>

          {/* Destination Warehouse (only for transfers) */}
          {formData.type === 'TRANSFER' ? (
            <Select
              label="Destination Warehouse"
              name="destination_warehouse_id"
              value={formData.destination_warehouse_id}
              onChange={handleChange}
              error={errors.destination_warehouse_id}
              required
            >
              <option value="">-- Destination Warehouse --</option>
              {warehouses.map((w) => (
                <option
                  key={w.id}
                  value={w.id}
                  disabled={String(w.id) === String(formData.warehouse_id)}
                >
                  {w.name} {String(w.id) === String(formData.warehouse_id) ? '(Source)' : ''}
                </option>
              ))}
            </Select>
          ) : (
            <div className="form-group">
              <span className="form-label">Available Stock</span>
              <div className="stock-info-card">
                <span className="stock-info-label">Current on hand:</span>
                <span className="stock-info-qty">
                  {currentQuantity} {selectedProduct?.unit || 'units'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quantity and Reference */}
        <div className="form-row-2">
          <Input
            label={
              formData.type === 'ADJUSTMENT'
                ? 'Target Actual Count'
                : 'Quantity Units'
            }
            name="quantity"
            type="number"
            min="1"
            placeholder={formData.type === 'ADJUSTMENT' ? 'e.g. 150' : 'e.g. 25'}
            value={formData.quantity}
            onChange={handleChange}
            error={errors.quantity}
            helperText={
              formData.type === 'ADJUSTMENT'
                ? 'Sets the verified physical count on hand'
                : selectedProduct?.unit
                ? `Unit: ${selectedProduct.unit}`
                : undefined
            }
            required
          />

          <Input
            label="Reference / Document #"
            name="reference"
            placeholder={
              formData.type === 'RECEIPT'
                ? 'PO-2026-0901'
                : formData.type === 'DELIVERY'
                ? 'SO-88219'
                : formData.type === 'TRANSFER'
                ? 'TRF-WH-04'
                : 'AUDIT-Q3'
            }
            value={formData.reference}
            onChange={handleChange}
            helperText="Optional tracking code, PO, or order ID"
          />
        </div>
      </form>
    </Modal>
  );
}
