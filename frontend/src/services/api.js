/**
 * StockSense API Client Service
 * Centralized API configuration with resilient fallbacks for demo-readiness.
 */

import {
  initialStats,
  mockProducts,
  mockLedger,
  mockReceipts,
  mockDeliveries,
  mockTransfers,
  mockWarehouses,
} from '../data/mockData';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Helper for standard HTTP fetch with timeout and error handling
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData.detail || `Request failed with status ${res.status}`;
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
    return await res.json();
  } catch (err) {
    console.warn(`[StockSense API] ${endpoint} request failed: ${err.message}. Using fallback data if applicable.`);
    throw err;
  }
}

// ----------------------------------------------------------------------
// Dashboard Endpoints
// ----------------------------------------------------------------------
export async function fetchDashboardSummary() {
  try {
    const data = await request('/dashboard/summary');
    return data;
  } catch {
    return initialStats;
  }
}

// ----------------------------------------------------------------------
// Products Endpoints
// ----------------------------------------------------------------------
export async function fetchProducts() {
  try {
    const data = await request('/products');
    return data;
  } catch {
    return mockProducts;
  }
}

export async function fetchProductById(id) {
  try {
    return await request(`/products/${id}`);
  } catch {
    return mockProducts.find((p) => p.id === Number(id)) || null;
  }
}

export async function createProduct(productData) {
  return await request('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
}

export async function updateProduct(id, productData) {
  return await request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
}

export async function deleteProduct(id) {
  return await request(`/products/${id}`, {
    method: 'DELETE',
  });
}

// ----------------------------------------------------------------------
// Warehouses Endpoints
// ----------------------------------------------------------------------
export async function fetchWarehouses() {
  try {
    const data = await request('/warehouses');
    return data;
  } catch {
    return mockWarehouses || [
      { id: 1, name: 'Main Warehouse', location: 'Chandigarh' },
      { id: 2, name: 'Production Unit', location: 'Mohali' },
    ];
  }
}

export async function createWarehouse(data) {
  return await request('/warehouses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ----------------------------------------------------------------------
// Stock Endpoints
// ----------------------------------------------------------------------
export async function fetchAllStock() {
  try {
    const data = await request('/stock');
    return data;
  } catch {
    return mockProducts.map((p, idx) => ({
      id: idx + 1,
      product_id: p.id,
      product_name: p.name,
      sku: p.sku,
      warehouse_id: 1,
      warehouse_name: 'Main Warehouse',
      quantity: p.stock || 50,
      reorder_level: p.reorderLevel || 20,
    }));
  }
}

export async function fetchStockByProduct(productId) {
  return await request(`/stock/${productId}`);
}

// ----------------------------------------------------------------------
// Inventory Operations
// ----------------------------------------------------------------------
export async function createReceipt(receiptData) {
  return await request('/inventory/receipts', {
    method: 'POST',
    body: JSON.stringify(receiptData),
  });
}

export async function createDelivery(deliveryData) {
  return await request('/inventory/deliveries', {
    method: 'POST',
    body: JSON.stringify(deliveryData),
  });
}

export async function createTransfer(transferData) {
  return await request('/inventory/transfers', {
    method: 'POST',
    body: JSON.stringify(transferData),
  });
}

export async function createAdjustment(adjustmentData) {
  return await request('/inventory/adjustments', {
    method: 'POST',
    body: JSON.stringify(adjustmentData),
  });
}

// ----------------------------------------------------------------------
// Ledger / Transactions
// ----------------------------------------------------------------------
export async function fetchLedgerTransactions() {
  try {
    const data = await request('/ledger/transactions');
    return data;
  } catch {
    return mockLedger;
  }
}
