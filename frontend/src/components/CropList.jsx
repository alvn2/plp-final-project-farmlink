import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

const CropList = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-plantingDate');

  useEffect(() => {
    fetchCrops();
  }, [filter, sortBy]);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      params.append('sort', sortBy);

      const response = await axios.get(`/api/crops?${params.toString()}`);
      setCrops(response.data.crops || []);
    } catch (error) {
      console.error('Fetch crops error:', error);
      setError('Failed to load crops. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteCrop = async (cropId, cropName) => {
    if (!window.confirm(`Are you sure you want to delete ${cropName}? This will also delete all associated tasks.`)) {
      return;
    }

    try {
      await axios.delete(`/api/crops/${cropId}`);
      setCrops(crops.filter(crop => crop._id !== cropId));
    } catch (error) {
      console.error('Delete crop error:', error);
      setError('Failed to delete crop. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const badgeClasses = {
      'Growing': 'badge badge-success',
      'Ready to Harvest': 'badge badge-warning',
      'Harvested': 'badge badge-secondary'
    };
    return badgeClasses[status] || 'badge badge-secondary';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString) => {
    const now = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = (plantingDate, harvestDate) => {
    const now = new Date();
    const planted = new Date(plantingDate);
    const harvest = new Date(harvestDate);
    
    const totalTime = harvest - planted;
    const elapsedTime = now - planted;
    
    const progress = Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
    return Math.round(progress);
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your crops..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                <i className="fas fa-seedling mr-3"></i>
                My Crops - Mazao Yangu
              </h1>
              <p className="text-gray-600">
                Manage and track all your crops from planting to harvest
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link to="/crops/new" className="btn-primary">
                <i className="fas fa-plus mr-2"></i>
                Add New Crop
              </Link>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-600 mr-2"></i>
              <p className="text-red-800">{error}</p>
              <button
                onClick={fetchCrops}
                className="ml-auto btn-secondary text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            
            {/* Filter by Status */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="select-field w-auto"
              >
                <option value="all">All Crops</option>
                <option value="Growing">Growing</option>
                <option value="Ready to Harvest">Ready to Harvest</option>
                <option value="Harvested">Harvested</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select-field w-auto"
              >
                <option value="-plantingDate">Newest First</option>
                <option value="plantingDate">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="-name">Name Z-A</option>
                <option value="expectedHarvestDate">Harvest Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Crops List */}
        {crops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <div key={crop._id} className="card hover:shadow-lg transition-shadow duration-300">
                
                {/* Crop Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-seedling text-primary-600 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
                      <span className={getStatusBadge(crop.status)}>
                        {crop.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Crop Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-calendar-plus mr-2 w-4"></i>
                    <span>Planted: {formatDate(crop.plantingDate)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-calendar-check mr-2 w-4"></i>
                    <span>Harvest: {formatDate(crop.expectedHarvestDate)}</span>
                  </div>

                  {crop.status === 'Growing' && (
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-clock mr-2 w-4"></i>
                      <span>
                        {getDaysUntil(crop.expectedHarvestDate) > 0 
                          ? `${getDaysUntil(crop.expectedHarvestDate)} days to harvest`
                          : 'Ready to harvest!'
                        }
                      </span>
                    </div>
                  )}

                  {/* Progress Bar for Growing Crops */}
                  {crop.status === 'Growing' && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Growth Progress</span>
                        <span>{getProgressPercentage(crop.plantingDate, crop.expectedHarvestDate)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(crop.plantingDate, crop.expectedHarvestDate)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {crop.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <i className="fas fa-sticky-note mr-1"></i>
                        {crop.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Link
                    to={`/crops/edit/${crop._id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                  >
                    <i className="fas fa-edit mr-1"></i>
                    Edit
                  </Link>
                  
                  <Link
                    to={`/tasks?cropId=${crop._id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    <i className="fas fa-tasks mr-1"></i>
                    Tasks
                  </Link>

                  <button
                    onClick={() => deleteCrop(crop._id, crop.name)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-seedling text-gray-400 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No crops found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't added any crops yet. Start by adding your first crop!"
                : `No crops found with status "${filter}". Try changing the filter.`
              }
            </p>
            {filter === 'all' ? (
              <Link to="/crops/new" className="btn-primary">
                <i className="fas fa-plus mr-2"></i>
                Add Your First Crop
              </Link>
            ) : (
              <button
                onClick={() => setFilter('all')}
                className="btn-secondary"
              >
                <i className="fas fa-filter mr-2"></i>
                Show All Crops
              </button>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {crops.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-soft border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Summary - Muhtasari
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {crops.filter(c => c.status === 'Growing').length}
                </p>
                <p className="text-sm text-gray-600">Growing</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {crops.filter(c => c.status === 'Ready to Harvest').length}
                </p>
                <p className="text-sm text-gray-600">Ready to Harvest</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {crops.filter(c => c.status === 'Harvested').length}
                </p>
                <p className="text-sm text-gray-600">Harvested</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {crops.length}
                </p>
                <p className="text-sm text-gray-600">Total Crops</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropList;