import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SimpleBookingWidget from './components/SimpleBookingWidget';
import AdminDashboard from './components/AdminDashboard';
import BackgroundMusic from './components/BackgroundMusic';
import PinkMistCanvas from './components/PinkMistCanvas';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      {/* Canvas rendered once at the true root — never inside a scrollable div */}
      <PinkMistCanvas />

      <Routes>
        <Route path="/" element={<SimpleBookingWidget />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <BackgroundMusic />
    </BrowserRouter>
  );
}

export default App;
