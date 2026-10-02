import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <Router>
        <MainLayout>
          <Dashboard />
        </MainLayout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
