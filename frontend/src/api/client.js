/**
 * StockSense API Client
 * Connects to the FastAPI backend endpoints.
 * Base URL defaults to http://localhost:8000 if not specified via VITE_API_URL.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Parse JSON response body if present
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg =
        (data && typeof data === 'object' && data.detail) ||
        (typeof data === 'string' && data) ||
        `Request failed with status ${response.status}: ${response.statusText}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkError = new Error(
        `Cannot reach StockSense API (${API_BASE}). Ensure the backend server is running.`
      );
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw err;
  }
}

export const api = {
  // Base Health
  checkHealth: () => request('/'),

  // Dashboard
  getDashboardSummary: () => request('/dashboard/summary'),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.set('skip', params.skip);
    if (params.limit !== undefined) query.set('limit', params.limit);
    const qs = query.toString();
    return request(`/products/${qs ? `?${qs}` : ''}`);
  },

  createProduct: (productData) =>
    request('/products/', {
      method: 'POST',
      body: JSON.stringify({
        name: productData.name.trim(),
        sku: productData.sku.trim(),
        category: productData.category?.trim() || null,
        unit: productData.unit?.trim() || 'pcs',
        reorder_level: Number(productData.reorder_level) || 0,
      }),
    }),

  getProduct: (productId) => request(`/products/${productId}`),

  // Warehouses
  getWarehouses: (params = {}) => {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.set('skip', params.skip);
    if (params.limit !== undefined) query.set('limit', params.limit);
    const qs = query.toString();
    return request(`/inventory/warehouses${qs ? `?${qs}` : ''}`);
  },

  createWarehouse: (warehouseData) =>
    request('/inventory/warehouses', {
      method: 'POST',
      body: JSON.stringify({
        name: warehouseData.name.trim(),
        location: warehouseData.location?.trim() || null,
      }),
    }),

  // Stock
  getStock: (params = {}) => {
    const query = new URLSearchParams();
    if (params.product_id !== undefined && params.product_id !== null && params.product_id !== '') {
      query.set('product_id', params.product_id);
    }
    if (params.warehouse_id !== undefined && params.warehouse_id !== null && params.warehouse_id !== '') {
      query.set('warehouse_id', params.warehouse_id);
    }
    const qs = query.toString();
    return request(`/inventory/stock${qs ? `?${qs}` : ''}`);
  },

  // Ledger / Transactions
  getTransactions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.product_id) query.set('product_id', params.product_id);
    if (params.warehouse_id) query.set('warehouse_id', params.warehouse_id);
    if (params.type && params.type !== 'ALL') query.set('type', params.type);
    if (params.skip !== undefined) query.set('skip', params.skip);
    if (params.limit !== undefined) query.set('limit', params.limit);
    const qs = query.toString();
    return request(`/ledger/transactions${qs ? `?${qs}` : ''}`);
  },

  createTransaction: (txData) =>
    request('/ledger/transactions', {
      method: 'POST',
      body: JSON.stringify({
        product_id: Number(txData.product_id),
        warehouse_id: Number(txData.warehouse_id),
        type: txData.type, // 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT'
        quantity: Number(txData.quantity),
        source_warehouse_id: txData.source_warehouse_id ? Number(txData.source_warehouse_id) : undefined,
        destination_warehouse_id: txData.destination_warehouse_id ? Number(txData.destination_warehouse_id) : undefined,
        reference: txData.reference?.trim() || null,
      }),
    }),
};
