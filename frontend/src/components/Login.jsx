import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import LoadingSpinner from './LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleRememberMe = (e) => {
    setFormData(prev => ({
      ...prev,
      rememberMe: e.target.checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Client-side validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-8 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md mx-auto p-8 rounded-xl shadow-soft border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-seedling text-primary-600 text-2xl"></i>
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sign In to FarmLink</h1>
          <p className={`text-gray-500 text-center mb-1 ${isDarkMode ? 'text-gray-300' : ''}`}>Ingia kwenye akaunti yako - Welcome back!</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle text-red-600 mr-2"></i>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
          {/* Email */}
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              <i className="fas fa-envelope mr-1"></i> Email Address / Barua pepe
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`input-field ${isDarkMode ? 'dark' : ''}`}
              placeholder="Enter your email address"
              autoComplete="email"
            />
          </div>
          {/* Password */}
          <div>
            <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              <i className="fas fa-lock mr-1"></i> Password / Nywila
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                className={`input-field ${isDarkMode ? 'dark' : ''} pr-10`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>
          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleRememberMe}
                className="mr-2"
              />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-primary-600 hover:underline text-sm">Forgot password?</Link>
          </div>
          {/* Submit Button */}
          <button type="submit" className="btn-primary w-full text-lg">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="spinner mr-2"></div>
                Signing in...
              </div>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i> Sign In - Ingia
              </>
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Don't have an account yet? <Link to="/register" className="text-primary-600 hover:underline">Register here - Jisajili hapa</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;