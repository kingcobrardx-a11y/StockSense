import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';

export function AddWarehouseModal({ isOpen, onClose, onSuccess }) {
  const { success, error: toastError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
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
    if (!formData.name.trim()) errs.name = 'Warehouse name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const created = await api.createWarehouse(formData);
      success(`Warehouse "${created.name}" created successfully.`);
      setFormData({ name: '', location: '' });
      if (onSuccess) onSuccess(created);
      onClose();
    } catch (err) {
      toastError(err.message || 'Failed to create warehouse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Warehouse"
      description="Register a storage facility or fulfillment center."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            icon="building"
          >
            Create Warehouse
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="form-stack">
        <Input
          label="Warehouse Name"
          name="name"
          placeholder="e.g. Central Distribution Hub A"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          autoFocus
        />

        <Input
          label="Physical Location / Address"
          name="location"
          placeholder="e.g. Building 4, North Cargo Bay, Seattle WA"
          value={formData.location}
          onChange={handleChange}
          helperText="Optional location or bay designation"
        />
      </form>
    </Modal>
  );
}
