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
import { DarkModeProvider, useDarkMode } from './context/DarkModeContext';
import { ToastContainer } from './components/Toast';
import Terms from './components/Terms';
import Privacy from './components/Privacy';

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
  const { isDarkMode } = useDarkMode();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

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
              <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center">
                  <div className="mb-4">
                    <i className="fas fa-exclamation-triangle text-6xl text-yellow-500"></i>
                  </div>
                  <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>404</h1>
                  <p className={`text-xl mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Ukurasa haujapatikana - Page not found</p>
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
      <footer className={`border-t py-6 mt-auto transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
    <ToastContainer>
      <DarkModeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </DarkModeProvider>
    </ToastContainer>
  );
}

export default App;