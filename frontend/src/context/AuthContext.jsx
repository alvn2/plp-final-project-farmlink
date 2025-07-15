import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set auth token in axios headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('farmlink_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('farmlink_token');
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('farmlink_token');
        
        if (token) {
          setAuthToken(token);
          
          // Verify token and get user data
          const response = await axios.get('/api/auth/me');
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      const { token, user: userData } = response.data;
      
      setAuthToken(token);
      setUser(userData);
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password, farmLocation = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        farmLocation
      });

      const { token, user: userData } = response.data;
      
      setAuthToken(token);
      setUser(userData);
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setError(null);
    
    // Clear any cached data
    localStorage.removeItem('farmlink_crops');
    localStorage.removeItem('farmlink_tasks');
    
    return { success: true, message: 'Logged out successfully' };
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put('/api/auth/profile', profileData);
      
      setUser(response.data.user);
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Profile update failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Auth context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};