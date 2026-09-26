import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Receipts from './pages/Receipts';
import Deliveries from './pages/Deliveries';
import Transfers from './pages/Transfers';
import Adjustments from './pages/Adjustments';
import StockLedger from './pages/StockLedger';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {/* Default redirect to /dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Core Navigation Routes */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="stock" element={<Stock />} />
          <Route path="receipts" element={<Receipts />} />
          <Route path="deliveries" element={<Deliveries />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="adjustments" element={<Adjustments />} />
          <Route path="ledger" element={<StockLedger />} />
          <Route path="settings" element={<Settings />} />

          {/* Backward compatibility aliases */}
          <Route path="operations">
            <Route index element={<Navigate to="/receipts" replace />} />
            <Route path="receipts" element={<Navigate to="/receipts" replace />} />
            <Route path="deliveries" element={<Navigate to="/deliveries" replace />} />
            <Route path="transfers" element={<Navigate to="/transfers" replace />} />
            <Route path="adjustments" element={<Navigate to="/adjustments" replace />} />
            <Route path="ledger" element={<Navigate to="/ledger" replace />} />
          </Route>
          <Route path="warehouse" element={<Navigate to="/settings" replace />} />
          <Route path="profile" element={<Navigate to="/settings" replace />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
