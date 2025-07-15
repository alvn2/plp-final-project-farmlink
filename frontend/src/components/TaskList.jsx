import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

const TaskList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    status: searchParams.get('status') || 'all',
    cropId: searchParams.get('cropId') || 'all'
  });
  const [sortBy, setSortBy] = useState('dueDate');

  useEffect(() => {
    fetchData();
  }, [filter, sortBy]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (filter.status !== 'all') params.set('status', filter.status);
    if (filter.cropId !== 'all') params.set('cropId', filter.cropId);
    setSearchParams(params);
  }, [filter, setSearchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch tasks and crops in parallel
      const [tasksResponse, cropsResponse] = await Promise.all([
        fetchTasks(),
        fetchCrops()
      ]);

      setTasks(tasksResponse);
      setCrops(cropsResponse);
    } catch (error) {
      console.error('Fetch data error:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    const params = new URLSearchParams();
    if (filter.status !== 'all') params.append('status', filter.status);
    if (filter.cropId !== 'all') params.append('cropId', filter.cropId);
    params.append('sort', sortBy);

    const response = await axios.get(`/api/tasks?${params.toString()}`);
    return response.data.tasks || [];
  };

  const fetchCrops = async () => {
    const response = await axios.get('/api/crops');
    return response.data.crops || [];
  };

  const deleteTask = async (taskId, taskDescription) => {
    if (!window.confirm(`Are you sure you want to delete this task: "${taskDescription}"?`)) {
      return;
    }

    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Delete task error:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  const completeTask = async (taskId) => {
    try {
      const response = await axios.patch(`/api/tasks/${taskId}/complete`);
      const updatedTask = response.data.task;
      
      setTasks(tasks.map(task => 
        task._id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Complete task error:', error);
      setError('Failed to complete task. Please try again.');
    }
  };

  const handleFilterChange = (type, value) => {
    setFilter(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const getStatusBadge = (status) => {
    const badgeClasses = {
      'Pending': 'badge badge-warning',
      'Completed': 'badge badge-success'
    };
    return badgeClasses[status] || 'badge badge-secondary';
  };

  const getPriorityBadge = (priority) => {
    const badgeClasses = {
      'Low': 'badge badge-secondary',
      'Medium': 'badge badge-primary',
      'High': 'badge badge-danger'
    };
    return badgeClasses[priority] || 'badge badge-secondary';
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

  const isOverdue = (dueDate, status) => {
    if (status === 'Completed') return false;
    return new Date() > new Date(dueDate);
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your tasks..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                <i className="fas fa-tasks mr-3"></i>
                My Tasks - Shughuli Zangu
              </h1>
              <p className="text-gray-600">
                Manage and track all your farm tasks and activities
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link to="/tasks/new" className="btn-primary">
                <i className="fas fa-plus mr-2"></i>
                Add New Task
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
                onClick={fetchData}
                className="ml-auto btn-secondary text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            
            {/* Filter by Status */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={filter.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="select-field w-auto"
              >
                <option value="all">All Tasks</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Filter by Crop */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Crop:</label>
              <select
                value={filter.cropId}
                onChange={(e) => handleFilterChange('cropId', e.target.value)}
                className="select-field w-auto"
              >
                <option value="all">All Crops</option>
                {crops.map((crop) => (
                  <option key={crop._id} value={crop._id}>
                    {crop.name}
                  </option>
                ))}
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
                <option value="dueDate">Due Date</option>
                <option value="-dueDate">Due Date (Latest)</option>
                <option value="priority">Priority</option>
                <option value="-createdAt">Recently Added</option>
                <option value="description">Description A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div 
                key={task._id} 
                className={`card hover:shadow-lg transition-shadow duration-300 ${
                  isOverdue(task.dueDate, task.status) ? 'border-l-4 border-red-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    
                    {/* Task Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-tasks text-yellow-600"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {task.description}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={getStatusBadge(task.status)}>
                            {task.status}
                          </span>
                          <span className={getPriorityBadge(task.priority)}>
                            {task.priority} Priority
                          </span>
                          {isOverdue(task.dueDate, task.status) && (
                            <span className="badge badge-danger">
                              <i className="fas fa-exclamation-triangle mr-1"></i>
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Task Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <i className="fas fa-seedling mr-2 w-4"></i>
                        <span>Crop: {task.cropId?.name || 'Unknown'}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <i className="fas fa-calendar-alt mr-2 w-4"></i>
                        <span>Due: {formatDate(task.dueDate)}</span>
                      </div>

                      <div className="flex items-center">
                        <i className="fas fa-clock mr-2 w-4"></i>
                        <span>
                          {task.status === 'Completed' 
                            ? `Completed ${task.completedAt ? formatDate(task.completedAt) : 'recently'}`
                            : getDaysUntil(task.dueDate) >= 0 
                              ? `${getDaysUntil(task.dueDate)} days left`
                              : `${Math.abs(getDaysUntil(task.dueDate))} days overdue`
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    {task.status === 'Pending' && (
                      <button
                        onClick={() => completeTask(task._id)}
                        className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50 transition-colors"
                        title="Mark as completed"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                    )}
                    
                    <Link
                      to={`/tasks/edit/${task._id}`}
                      className="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50 transition-colors"
                      title="Edit task"
                    >
                      <i className="fas fa-edit"></i>
                    </Link>

                    <button
                      onClick={() => deleteTask(task._id, task.description)}
                      className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete task"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-tasks text-gray-400 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">
              {filter.status === 'all' && filter.cropId === 'all'
                ? "You haven't added any tasks yet. Start by creating your first task!"
                : "No tasks found with the selected filters. Try changing the filters or add new tasks."
              }
            </p>
            {filter.status === 'all' && filter.cropId === 'all' && crops.length > 0 ? (
              <Link to="/tasks/new" className="btn-primary">
                <i className="fas fa-plus mr-2"></i>
                Add Your First Task
              </Link>
            ) : crops.length === 0 ? (
              <div className="space-y-4">
                <p className="text-gray-500 text-sm">You need to add crops before creating tasks.</p>
                <Link to="/crops/new" className="btn-primary">
                  <i className="fas fa-seedling mr-2"></i>
                  Add Your First Crop
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                <button
                  onClick={() => setFilter({ status: 'all', cropId: 'all' })}
                  className="btn-secondary"
                >
                  <i className="fas fa-filter mr-2"></i>
                  Show All Tasks
                </button>
                <Link to="/tasks/new" className="btn-primary">
                  <i className="fas fa-plus mr-2"></i>
                  Add New Task
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {tasks.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-soft border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Task Summary - Muhtasari wa Shughuli
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {tasks.filter(t => t.status === 'Pending').length}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.status === 'Completed').length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {tasks.filter(t => isOverdue(t.dueDate, t.status)).length}
                </p>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {tasks.length}
                </p>
                <p className="text-sm text-gray-600">Total Tasks</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;