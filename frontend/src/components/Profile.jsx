import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    farmLocation: ''
  });

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <i className="fas fa-user mr-3"></i>
            My Profile - Wasifu Wangu
          </h1>
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
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Information
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-user mr-1"></i>
                  Full Name / Jina kamili *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Farm Location Field */}
              <div>
                <label htmlFor="farmLocation" className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-map-marker-alt mr-1"></i>
                  Farm Location / Mahali pa shamba
                </label>
                <select
                  id="farmLocation"
                  name="farmLocation"
                  value={formData.farmLocation}
                  onChange={handleChange}
                  className="select-field"
                >
                  <option value="">Select your county / Chagua kaunti yako</option>
                  {kenyanCounties.map((county) => (
                    <option key={county} value={county}>
                      {county} County
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                  disabled={isLoading}
                >
                  <i className="fas fa-times mr-2"></i>
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="spinner mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-primary-600 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Full Name
                  </label>
                  <p className="text-lg text-gray-900">{user.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Email Address
                  </label>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Farm Location
                  </label>
                  <p className="text-lg text-gray-900">
                    {user.farmLocation ? `${user.farmLocation} County` : 'Not specified'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Member Since
                  </label>
                  <p className="text-lg text-gray-900">
                    {user.createdAt ? formatDate(user.createdAt) : 'Recently joined'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-soft border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Overview - Muhtasari wa Akaunti
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-seedling text-white"></i>
              </div>
              <p className="text-sm text-gray-600">Total Crops</p>
              <p className="text-xl font-bold text-primary-600">-</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-tasks text-white"></i>
              </div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-xl font-bold text-yellow-600">-</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;