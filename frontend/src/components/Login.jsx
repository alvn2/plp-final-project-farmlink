import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
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

  // Demo credentials helper
  const fillDemoCredentials = () => {
    setFormData({
      email: 'james@farmlink.ke',
      password: 'password123'
    });
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Signing you in..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-seedling text-white text-2xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back!
          </h2>
          <p className="text-lg text-gray-600 mb-1">
            Karibu tena! - Sign in to your farm
          </p>
          <p className="text-sm text-gray-500">
            Access your crops and farming tasks
          </p>
        </div>

        {/* Demo Credentials Helper */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Try Demo Account</p>
              <p className="text-xs text-blue-600">Use sample farmer data</p>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors"
            >
              Fill Demo Data
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle text-red-600 mr-2"></i>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              <i className="fas fa-envelope mr-1"></i>
              Email Address / Barua pepe
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your email address"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              <i className="fas fa-lock mr-1"></i>
              Password / Nywila
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field pr-10"
                placeholder="Enter your password"
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="spinner mr-2"></div>
                Signing in...
              </div>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i>
                Sign In - Ingia
              </>
            )}
          </button>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Register here - Jisajili hapa
              </Link>
            </p>
          </div>
        </form>

        {/* Additional Info */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span><i className="fas fa-shield-alt"></i> Secure</span>
            <span><i className="fas fa-mobile-alt"></i> Mobile Friendly</span>
            <span><i className="fas fa-free-code-camp"></i> Free</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;