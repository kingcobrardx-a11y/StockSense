import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Receipts from './pages/Receipts';
import Deliveries from './pages/Deliveries';
import Transfers from './pages/Transfers';
import Adjustments from './pages/Adjustments';
import StockLedger from './pages/StockLedger';
import Warehouse from './pages/Warehouse';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {/* Dashboard (Home) */}
          <Route index element={<Dashboard />} />

          {/* Products Catalog */}
          <Route path="products" element={<Products />} />

          {/* Operations Sub-routes */}
          <Route path="operations">
            <Route index element={<Navigate to="/operations/receipts" replace />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="transfers" element={<Transfers />} />
            <Route path="adjustments" element={<Adjustments />} />
            <Route path="ledger" element={<StockLedger />} />
          </Route>

          {/* Facility & Profile */}
          <Route path="warehouse" element={<Warehouse />} />
          <Route path="profile" element={<Profile />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
