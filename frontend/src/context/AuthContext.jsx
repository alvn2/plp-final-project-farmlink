import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../components/Toast';

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
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://plp-final-project-farmlink.onrender.com';
axios.defaults.timeout = 10000; // 10 second timeout

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

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
          const response = await axios.get('/api/auth/profile');
          // Handle both response structures (with and without data wrapper)
          const responseData = response.data.data || response.data;
          setUser(responseData.user);
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

      // Handle both response structures (with and without data wrapper)
      const responseData = response.data.data || response.data;
      const { token, user: userData } = responseData;
      
      setAuthToken(token);
      setUser(userData);
      
      const successMessage = response.data.message || 'Login successful!';
      toast.success(successMessage);
      return { success: true, message: successMessage };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.data) {
        // Handle different error response structures
        errorMessage = error.response.data.message || 
                      error.response.data.error || 
                      error.response.data.errorMessage || 
                      errorMessage;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
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

      // Handle both response structures (with and without data wrapper)
      const responseData = response.data.data || response.data;
      const { token, user: userData } = responseData;
      
      setAuthToken(token);
      setUser(userData);
      
      const successMessage = response.data.message || 'Registration successful!';
      toast.success(successMessage);
      return { success: true, message: successMessage };
    } catch (error) {
      console.error('Registration error:', error);
      let message = "Registration failed. Please try again.";
      
      if (error.response?.data) {
        // Handle different error response structures
        message = error.response.data.message || 
                  error.response.data.error || 
                  error.response.data.errorMessage || 
                  message;
      } else if (error.code === 'ECONNABORTED') {
        message = 'Request timed out. Please check your internet connection.';
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
      return { success: false, error: message };
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
    
    toast.info('Logged out successfully');
    return { success: true, message: 'Logged out successfully' };
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put('/api/auth/profile', profileData);
      
      // Handle both response structures (with and without data wrapper)
      const responseData = response.data.data || response.data;
      setUser(responseData.user);
      
      toast.success('Profile updated successfully!');
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Profile update failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
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