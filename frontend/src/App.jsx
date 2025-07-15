import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CropList from './components/CropList';
import CropForm from './components/CropForm';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import Profile from './components/Profile';
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Public Route component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return !user ? children : <Navigate to="/dashboard" replace />;
};

// Main App component
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Home />
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/crops" 
            element={
              <ProtectedRoute>
                <CropList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/crops/new" 
            element={
              <ProtectedRoute>
                <CropForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/crops/edit/:id" 
            element={
              <ProtectedRoute>
                <CropForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <TaskList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks/new" 
            element={
              <ProtectedRoute>
                <TaskForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks/edit/:id" 
            element={
              <ProtectedRoute>
                <TaskForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* 404 Route */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="mb-4">
                    <i className="fas fa-exclamation-triangle text-6xl text-yellow-500"></i>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                  <p className="text-xl text-gray-600 mb-6">Ukurasa haujapatikana - Page not found</p>
                  <button 
                    onClick={() => window.history.back()} 
                    className="btn-primary"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Rudi Nyuma - Go Back
                  </button>
                </div>
              </div>
            } 
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              <i className="fas fa-seedling text-primary-600 mr-2"></i>
              FarmLink - Msimamizi wa Mazao
            </p>
            <p className="text-sm">
              Kuongoza wakulima wadogo wa Kenya kuelekea kilimo bora zaidi.
            </p>
            <div className="mt-3 flex justify-center space-x-4 text-sm">
              <span>© 2025 FarmLink</span>
              <span>•</span>
              <span>Imejengwa kwa upendo wa kilimo</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main App with providers
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;