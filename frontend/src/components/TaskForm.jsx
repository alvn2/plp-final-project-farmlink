import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

const TaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    cropId: '',
    description: '',
    dueDate: '',
    status: 'Pending',
    priority: 'Medium'
  });
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const priorityOptions = ['Low', 'Medium', 'High'];
  const statusOptions = ['Pending', 'Completed'];

  useEffect(() => {
    fetchCrops();
    if (isEditing) {
      fetchTask();
    }
  }, [id, isEditing]);

  const fetchCrops = async () => {
    try {
      const response = await axios.get('/api/crops');
      setCrops(response.data.data?.crops || response.data.crops || []);
    } catch (error) {
      console.error('Fetch crops error:', error);
      setError('Failed to load crops. Please try again.');
    }
  };

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tasks/${id}`);
      const task = response.data.data?.task || response.data.task;
      setFormData({
        cropId: task.cropId._id || task.cropId,
        description: task.description,
        dueDate: task.dueDate.split('T')[0], // Format date for input
        status: task.status,
        priority: task.priority || 'Medium'
      });
    } catch (error) {
      console.error('Fetch task error:', error);
      setError('Failed to load task data. Please try again.');
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
    if (!formData.cropId || !formData.description || !formData.dueDate) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const dueDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      setError('Due date cannot be in the past.');
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        await axios.put(`/api/tasks/${id}`, formData);
      } else {
        await axios.post('/api/tasks', formData);
      }
      
      navigate('/tasks');
    } catch (error) {
      console.error('Save task error:', error);
      setError(error.response?.data?.error || 'Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/tasks');
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  if (loading && isEditing) {
    return <LoadingSpinner fullScreen text="Loading task data..." />;
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
                <i className="fas fa-tasks mr-3"></i>
                {isEditing ? 'Edit Task' : 'Add New Task'}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Hariri shughuli - Update your task' : 'Ongeza shughuli mpya - Add a new farm task'}
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

          {/* No Crops Warning */}
          {crops.length === 0 && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                <div>
                  <p className="text-yellow-800 font-medium">No crops found!</p>
                  <p className="text-yellow-700 text-sm">You need to add crops before creating tasks.</p>
                  <button
                    onClick={() => navigate('/crops/new')}
                    className="mt-2 text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                  >
                    Add a crop first →
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Crop Selection */}
            <div>
              <label htmlFor="cropId" className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-seedling mr-1"></i>
                Select Crop / Chagua zao *
              </label>
              <select
                id="cropId"
                name="cropId"
                required
                value={formData.cropId}
                onChange={handleChange}
                className="select-field"
                disabled={crops.length === 0}
              >
                <option value="">Choose a crop for this task</option>
                {crops.map((crop) => (
                  <option key={crop._id} value={crop._id}>
                    {crop.name} (Planted: {new Date(crop.plantingDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select which crop this task is for
              </p>
            </div>

            {/* Task Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-clipboard-list mr-1"></i>
                Task Description / Maelezo ya shughuli *
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                required
                value={formData.description}
                onChange={handleChange}
                className="input-field resize-none"
                placeholder="Describe the task to be done (e.g., 'Apply fertilizer to maize crop', 'Weed the bean field')"
                maxLength="200"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/200 characters
              </p>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-calendar-alt mr-1"></i>
                Due Date / Tarehe ya mwisho *
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                required
                value={formData.dueDate}
                onChange={handleChange}
                min={today}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                When should this task be completed?
              </p>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-flag mr-1"></i>
                Priority / Kipaumbele
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="select-field"
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                How important is this task?
              </p>
            </div>

            {/* Status (only show when editing) */}
            {isEditing && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-info-circle mr-1"></i>
                  Task Status / Hali ya shughuli
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="select-field"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Update the current status of this task
                </p>
              </div>
            )}

            {/* Task Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <i className="fas fa-lightbulb text-blue-600 mr-2 mt-1"></i>
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">Task Management Tips:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Set realistic due dates to avoid overwhelming yourself</li>
                    <li>• Use High priority for urgent tasks like pest control</li>
                    <li>• Be specific in descriptions for better planning</li>
                    <li>• Link tasks to the appropriate crop for better organization</li>
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
                disabled={loading || crops.length === 0}
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
                    {isEditing ? 'Update Task' : 'Add Task'}
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

export default TaskForm;