import React from 'react';
import { useDarkMode } from '../context/DarkModeContext';

const Terms = () => {
  const { isDarkMode } = useDarkMode();
  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-2xl mx-auto p-8 rounded-xl shadow-soft border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Terms of Service</h1>
        <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Welcome to FarmLink! By using our platform, you agree to the following terms:</p>
        <ul className={`list-disc pl-6 space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <li>You must provide accurate information when registering and using FarmLink.</li>
          <li>You are responsible for maintaining the confidentiality of your account.</li>
          <li>Do not use FarmLink for any unlawful or harmful activities.</li>
          <li>We may update these terms at any time. Continued use means you accept the new terms.</li>
          <li>FarmLink is provided as-is, without warranties of any kind.</li>
        </ul>
        <p className={`mt-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>If you have questions about these terms, contact us at support@farmlink.ke.</p>
      </div>
    </div>
  );
};

export default Terms; 