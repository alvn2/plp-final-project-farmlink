import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt', swahili: 'Dashibodi' },
    { path: '/crops', label: 'Crops', icon: 'fas fa-seedling', swahili: 'Mazao' },
    { path: '/tasks', label: 'Tasks', icon: 'fas fa-tasks', swahili: 'Shughuli' },
    { path: '/profile', label: 'Profile', icon: 'fas fa-user', swahili: 'Wasifu' }
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link 
              to={user ? "/dashboard" : "/"} 
              className="flex items-center space-x-3 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-seedling text-white text-lg"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">FarmLink</span>
                <span className="text-xs text-gray-500 hidden sm:block">Mazao Manager</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    isActive(link.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <i className={link.icon}></i>
                  <span className="hidden lg:block">{link.label}</span>
                  <span className="lg:hidden">{link.swahili}</span>
                </Link>
              ))}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* User Info */}
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">
                    {user.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user.farmLocation || 'Mkulima'}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span className="hidden sm:block">Logout</span>
                </button>

                {/* Mobile Menu Button */}
                <button
                  onClick={toggleMenu}
                  className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {user && isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-3 ${
                    isActive(link.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <i className={link.icon}></i>
                  <span>{link.label} ({link.swahili})</span>
                </Link>
              ))}
              
              {/* Mobile User Info */}
              <div className="px-3 py-2 border-t border-gray-200 mt-2">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-gray-500">{user.email}</p>
                  {user.farmLocation && (
                    <p className="text-gray-500">{user.farmLocation}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;