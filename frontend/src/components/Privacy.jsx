import React from 'react';
import { useDarkMode } from '../context/DarkModeContext';

const Privacy = () => {
  const { isDarkMode } = useDarkMode();
  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-2xl mx-auto p-8 rounded-xl shadow-soft border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Privacy Policy</h1>
        <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Your privacy is important to us. This policy explains how FarmLink collects and uses your information:</p>
        <ul className={`list-disc pl-6 space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <li>We collect information you provide during registration and use of FarmLink.</li>
          <li>Your data is used to provide and improve our services.</li>
          <li>We do not sell your personal information to third parties.</li>
          <li>We may use cookies and analytics to enhance your experience.</li>
          <li>You can request deletion of your account and data at any time.</li>
        </ul>
        <p className={`mt-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>For questions about this policy, contact us at privacy@farmlink.ke.</p>
      </div>
    </div>
  );
};

export default Privacy; 