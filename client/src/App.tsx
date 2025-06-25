import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import Homepage from './pages/Homepage';
import AdminDashboard from './pages/admin/admin';
import OrderPage from './pages/order/order';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/order' element={<OrderPage />} />
      </Routes>
    </Router>
  );
}

export default App;
