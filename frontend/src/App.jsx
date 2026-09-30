import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';

export function App() {
  return (
    <Router>
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </Router>
  );
}

export default App;
