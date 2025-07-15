import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          <div className={`spinner mx-auto mb-4 ${sizeClasses[size]}`}></div>
          <p className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
            {text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <div className={`spinner mx-auto mb-4 ${sizeClasses[size]}`}></div>
        <p className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
          {text}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;