import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import LoadingSpinner from './LoadingSpinner';

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    farmLocation: ''
  });
  const [stats, setStats] = useState({ crops: 0, tasks: 0 });

  const kenyanCounties = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
    'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
    'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos',
    'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a',
    'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
    'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia',
    'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        farmLocation: user.farmLocation || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [cropsRes, tasksRes] = await Promise.all([
          axios.get('/api/crops'),
          axios.get('/api/tasks')
        ]);
        setStats({
          crops: cropsRes.data.data?.crops?.length || cropsRes.data.crops?.length || 0,
          tasks: tasksRes.data.data?.tasks?.length || tasksRes.data.tasks?.length || 0
        });
      } catch (e) {
        setStats({ crops: '-', tasks: '-' });
      }
    };
    fetchStats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Client-side validation
    if (!formData.name.trim()) {
      setError('Name is required.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await updateProfile({
        name: formData.name.trim(),
        farmLocation: formData.farmLocation
      });

      if (result.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      farmLocation: user?.farmLocation || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || !user) {
    return <LoadingSpinner fullScreen text="Loading your profile..." />;
  }

  return (
    <div className={`min-h-screen py-8 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Profile - Wasifu Wangu</h1>
          <p className="text-gray-600">
            Manage your account information and farm details
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <i className="fas fa-check-circle text-green-600 mr-2"></i>
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-600 mr-2"></i>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className={`w-full max-w-xl mx-auto p-8 rounded-xl shadow-soft border mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile Information</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 mb-6">
            <div className="flex-shrink-0 w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl text-primary-600">
              <i className="fas fa-user"></i>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name}</div>
              <div className={`text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user?.email}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.farmLocation || 'No farm location set'}</div>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="btn-primary">
              <i className="fas fa-edit mr-2"></i> Edit Profile
            </button>
          </div>
        </div>

        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`rounded-lg p-6 shadow-soft border ${isDarkMode ? 'bg-green-900 border-green-800' : 'bg-green-50 border-green-200'}`}> 
            <div className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-green-900'}`}>Total Crops</div>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-green-900'}`}>{stats.crops}</div>
          </div>
          <div className={`rounded-lg p-6 shadow-soft border ${isDarkMode ? 'bg-yellow-900 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}> 
            <div className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-yellow-900'}`}>Total Tasks</div>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-yellow-900'}`}>{stats.tasks}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;