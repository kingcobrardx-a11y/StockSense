// StockSense API Client Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

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
    const response = await fetch(url, config);

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { detail: text } : null;
    }

    if (!response.ok) {
      let errorMsg = `Request failed with status ${response.status}`;
      if (data) {
        if (typeof data.detail === 'string') {
          errorMsg = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMsg = data.detail
            .map((item) => `${item.loc ? item.loc.slice(-1)[0] + ': ' : ''}${item.msg}`)
            .join('; ');
        } else if (data.message) {
          errorMsg = data.message;
        }
      }
      throw new ApiError(errorMsg, response.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err.message || 'Unable to connect to backend server. Make sure FastAPI is running on http://127.0.0.1:8000.',
      0,
      null
    );
  }
}

export const productService = {
  // GET /products
  getAll: () => request('/products'),

  // GET /products/{id}
  getById: (id) => request(`/products/${id}`),

  // POST /products
  create: (product) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),

  // PUT /products/{id}
  update: (id, product) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),

  // DELETE /products/{id}
  delete: (id) =>
    request(`/products/${id}`, {
      method: 'DELETE',
    }),

  // GET /stock
  getStock: () => request('/stock'),
};
