import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';

const COMMON_CATEGORIES = [
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Hardware & Tools', label: 'Hardware & Tools' },
  { value: 'Pharmaceuticals', label: 'Pharmaceuticals' },
  { value: 'Raw Materials', label: 'Raw Materials' },
  { value: 'Packaging', label: 'Packaging' },
  { value: 'General Inventory', label: 'General Inventory' },
];

const COMMON_UNITS = [
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'box', label: 'Boxes (box)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'carton', label: 'Cartons (carton)' },
  { value: 'pallets', label: 'Pallets' },
];

export function AddProductModal({ isOpen, onClose, onSuccess }) {
  const { success, error: toastError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    unit: 'pcs',
    reorder_level: 10,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.sku.trim()) errs.sku = 'SKU is required';
    if (Number(formData.reorder_level) < 0) {
      errs.reorder_level = 'Reorder level cannot be negative';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const created = await api.createProduct({
        ...formData,
        reorder_level: Number(formData.reorder_level) || 0,
      });
      success(`Product "${created.name}" (SKU: ${created.sku}) created successfully.`);
      // Reset form
      setFormData({
        name: '',
        sku: '',
        category: 'Electronics',
        unit: 'pcs',
        reorder_level: 10,
      });
      if (onSuccess) onSuccess(created);
      onClose();
    } catch (err) {
      toastError(err.message || 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Product"
      description="Create a catalog item with inventory tracking parameters."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            icon="plus"
          >
            Create Product
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="form-stack">
        <Input
          label="Product Name"
          name="name"
          placeholder="e.g. Industrial Barcode Scanner"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          autoFocus
        />

        <div className="form-row-2">
          <Input
            label="SKU (Stock Keeping Unit)"
            name="sku"
            placeholder="e.g. SCN-BAR-001"
            value={formData.sku}
            onChange={handleChange}
            error={errors.sku}
            helperText="Must be unique across the catalog"
            required
          />

          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={COMMON_CATEGORIES}
          />
        </div>

        <div className="form-row-2">
          <Select
            label="Unit of Measurement"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            options={COMMON_UNITS}
          />

          <Input
            label="Reorder Level (Threshold)"
            name="reorder_level"
            type="number"
            min="0"
            value={formData.reorder_level}
            onChange={handleChange}
            error={errors.reorder_level}
            helperText="Low stock alert triggers when on-hand <= threshold"
          />
        </div>
      </form>
    </Modal>
  );
}
