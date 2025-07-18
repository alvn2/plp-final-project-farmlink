import React, { useState, useEffect } from 'react';

// Toast context
const ToastContext = React.createContext();

// Toast types
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Toast component
const Toast = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ease-in-out";
    
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return `${baseStyles} bg-green-500 text-white`;
      case TOAST_TYPES.ERROR:
        return `${baseStyles} bg-red-500 text-white`;
      case TOAST_TYPES.WARNING:
        return `${baseStyles} bg-yellow-500 text-white`;
      case TOAST_TYPES.INFO:
        return `${baseStyles} bg-blue-500 text-white`;
      default:
        return `${baseStyles} bg-gray-500 text-white`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return "✓";
      case TOAST_TYPES.ERROR:
        return "✕";
      case TOAST_TYPES.WARNING:
        return "⚠";
      case TOAST_TYPES.INFO:
        return "ℹ";
      default:
        return "•";
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2 text-lg">{getIcon()}</span>
          <span className="text-sm font-medium">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Toast container component
const ToastContainer = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = TOAST_TYPES.INFO) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (message) => addToast(message, TOAST_TYPES.SUCCESS),
    error: (message) => addToast(message, TOAST_TYPES.ERROR),
    warning: (message) => addToast(message, TOAST_TYPES.WARNING),
    info: (message) => addToast(message, TOAST_TYPES.INFO)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook to use toast
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastContainer');
  }
  return context;
};

export { ToastContainer, TOAST_TYPES }; 