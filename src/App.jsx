import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SimpleBookingWidget from './components/SimpleBookingWidget';
import AdminDashboard from './components/AdminDashboard';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SimpleBookingWidget />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
