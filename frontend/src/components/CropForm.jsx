import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

const CropForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    plantingDate: '',
    expectedHarvestDate: '',
    notes: '',
    status: 'Growing'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cropStatuses = [
    'Growing',
    'Ready to Harvest',
    'Harvested'
  ];

  useEffect(() => {
    if (isEditing) {
      fetchCrop();
    }
  }, [id, isEditing]);

  const fetchCrop = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/crops/${id}`);
      const crop = response.data.crop;
      
      setFormData({
        name: crop.name,
        plantingDate: crop.plantingDate.split('T')[0], // Format date for input
        expectedHarvestDate: crop.expectedHarvestDate.split('T')[0],
        notes: crop.notes || '',
        status: crop.status
      });
    } catch (error) {
      console.error('Fetch crop error:', error);
      setError('Failed to load crop data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    setLoading(true);
    setError('');

    // Client-side validation
    if (!formData.name || !formData.plantingDate || !formData.expectedHarvestDate) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const plantingDate = new Date(formData.plantingDate);
    const harvestDate = new Date(formData.expectedHarvestDate);

    if (harvestDate <= plantingDate) {
      setError('Expected harvest date must be after planting date.');
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        await axios.put(`/api/crops/${id}`, formData);
      } else {
        await axios.post('/api/crops', formData);
      }
      
      navigate('/crops');
    } catch (error) {
      console.error('Save crop error:', error);
      setError(error.response?.data?.error || 'Failed to save crop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/crops');
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  if (loading && isEditing) {
    return <LoadingSpinner fullScreen text="Loading crop data..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <i className="fas fa-seedling mr-3"></i>
                {isEditing ? 'Edit Crop' : 'Add New Crop'}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Hariri zao - Update your crop information' : 'Ongeza zao jipya - Add a new crop to your farm'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle text-red-600 mr-2"></i>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Crop Type */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-seedling mr-1"></i>
                Crop Type / Aina ya zao *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter crop name (e.g., Maize, Beans, Sukuma Wiki, Tomatoes, etc.)"
                maxLength="100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Type the name of the crop you're growing
              </p>
            </div>

            {/* Planting Date */}
            <div>
              <label htmlFor="plantingDate" className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-calendar-plus mr-1"></i>
                Planting Date / Tarehe ya kupanda *
              </label>
              <input
                id="plantingDate"
                name="plantingDate"
                type="date"
                required
                value={formData.plantingDate}
                onChange={handleChange}
                max={today}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                When did you plant this crop?
              </p>
            </div>

            {/* Expected Harvest Date */}
            <div>
              <label htmlFor="expectedHarvestDate" className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-calendar-check mr-1"></i>
                Expected Harvest Date / Tarehe ya kuvuna *
              </label>
              <input
                id="expectedHarvestDate"
                name="expectedHarvestDate"
                type="date"
                required
                value={formData.expectedHarvestDate}
                onChange={handleChange}
                min={formData.plantingDate || today}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                When do you expect to harvest this crop?
              </p>
            </div>

            {/* Status (only show when editing) */}
            {isEditing && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-info-circle mr-1"></i>
                  Crop Status / Hali ya zao
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="select-field"
                >
                  {cropStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Update the current status of your crop
                </p>
              </div>
            )}

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-sticky-note mr-1"></i>
                Notes / Maelezo (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="4"
                value={formData.notes}
                onChange={handleChange}
                className="input-field resize-none"
                placeholder="Add any additional notes about this crop (e.g., fertilizer used, weather conditions, etc.)"
                maxLength="500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.notes.length}/500 characters
              </p>
            </div>

            {/* Helpful Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <i className="fas fa-lightbulb text-blue-600 mr-2 mt-1"></i>
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">Farming Tips:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Maize typically takes 90-120 days from planting to harvest</li>
                    <li>• Beans usually mature in 60-90 days</li>
                    <li>• Sukuma Wiki can be harvested 4-6 weeks after planting</li>
                    <li>• Keep detailed notes about fertilizers and weather for better planning</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
                disabled={loading}
              >
                <i className="fas fa-times mr-2"></i>
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </div>
                ) : (
                  <>
                    <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                    {isEditing ? 'Update Crop' : 'Add Crop'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CropForm;