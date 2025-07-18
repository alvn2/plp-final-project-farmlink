import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    crops: [],
    tasks: [],
    stats: {
      totalCrops: 0,
      statusCounts: {
        Growing: 0,
        'Ready to Harvest': 0,
        Harvested: 0
      },
      upcomingHarvests: 0,
      cropsByType: {}
    },
    upcomingTasks: [],
    overdueTasks: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch crops, tasks, and stats in parallel
      const [cropsResponse, tasksResponse] = await Promise.all([
        axios.get('/api/crops'),
        axios.get('/api/tasks')
      ]);

      // Calculate stats from crops data
      const crops = cropsResponse.data.data?.crops || cropsResponse.data.crops || [];
      const allTasks = tasksResponse.data.data?.tasks || tasksResponse.data.tasks || [];

      console.log('Dashboard Debug - Crops:', crops);
      console.log('Dashboard Debug - All Tasks:', allTasks);
      console.log('Dashboard Debug - Tasks Response:', tasksResponse.data);

      // Status counts
      const statusCounts = {
        Growing: 0,
        'Ready to Harvest': 0,
        Harvested: 0
      };

      crops.forEach(crop => {
        statusCounts[crop.status] = (statusCounts[crop.status] || 0) + 1;
      });

      // Crops by type
      const cropsByType = {};
      crops.forEach(crop => {
        cropsByType[crop.name] = (cropsByType[crop.name] || 0) + 1;
      });

      // Upcoming harvests (next 30 days)
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      const upcomingHarvests = crops.filter(crop => {
        const harvestDate = new Date(crop.expectedHarvestDate);
        return harvestDate >= now && harvestDate <= thirtyDaysFromNow && crop.status === 'Growing';
      }).length;

      const upcomingTasks = allTasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
        return dueDate >= now && dueDate <= sevenDaysFromNow && task.status === 'Pending';
      }).slice(0, 5);

      const overdueTasks = allTasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        return dueDate < now && task.status === 'Pending';
      }).slice(0, 5);

      console.log('Dashboard Debug - Upcoming Tasks:', upcomingTasks);
      console.log('Dashboard Debug - Overdue Tasks:', overdueTasks);

      setDashboardData({
        crops: crops.slice(0, 5), // Show latest 5 crops
        tasks: allTasks.slice(0, 5), // Show latest 5 tasks
        stats: {
          totalCrops: crops.length,
          statusCounts,
          upcomingHarvests,
          cropsByType
        },
        upcomingTasks,
        overdueTasks
      });

    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Chart data for crop status
  const chartData = {
    labels: ['Growing', 'Ready to Harvest', 'Harvested'],
    datasets: [
      {
        label: 'Number of Crops',
        data: [
          dashboardData.stats.statusCounts.Growing,
          dashboardData.stats.statusCounts['Ready to Harvest'],
          dashboardData.stats.statusCounts.Harvested
        ],
        backgroundColor: [
          '#34D399', // Green for Growing
          '#FBBF24', // Yellow for Ready to Harvest
          '#60A5FA'  // Blue for Harvested
        ],
        borderColor: [
          '#059669',
          '#D97706',
          '#2563EB'
        ],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Farm Progress - Maendeleo ya Shamba',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: isDarkMode ? '#f9fafb' : '#1f2937'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Crops',
          color: isDarkMode ? '#f9fafb' : '#1f2937'
        },
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: isDarkMode ? '#f9fafb' : '#1f2937'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Crop Status',
          color: isDarkMode ? '#f9fafb' : '#1f2937'
        },
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: isDarkMode ? '#f9fafb' : '#1f2937'
        }
      }
    }
  };

  const getStatusBadge = (status) => {
    const badgeClasses = {
      'Growing': 'badge badge-success',
      'Ready to Harvest': 'badge badge-warning',
      'Harvested': 'badge badge-secondary',
      'Pending': 'badge badge-warning',
      'Completed': 'badge badge-success'
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

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your dashboard..." />;
  }

  return (
    <div className={`min-h-screen py-8 transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                  Habari {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-primary-100 text-lg">
                  Welcome to your farm dashboard - Karibu kwenye dashibodi yako
                </p>
                {user?.farmLocation && (
                  <p className="text-primary-200 text-sm mt-1">
                    <i className="fas fa-map-marker-alt mr-1"></i>
                    {user.farmLocation}
                  </p>
                )}
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <i className="fas fa-seedling text-2xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-8 border rounded-lg p-4 transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-red-900 border-red-700' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-600 mr-2"></i>
              <p className={isDarkMode ? 'text-red-200' : 'text-red-800'}>{error}</p>
              <button
                onClick={fetchDashboardData}
                className="ml-auto btn-secondary text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-seedling text-primary-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Crops</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{dashboardData.stats.totalCrops}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mazao yote</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-leaf text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Growing</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{dashboardData.stats.statusCounts.Growing}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Yanayokua</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-calendar-check text-yellow-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Ready</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{dashboardData.stats.statusCounts['Ready to Harvest']}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tayari kuvuna</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-warehouse text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Harvested</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{dashboardData.stats.statusCounts.Harvested}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Zilizokolewa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Charts and Stats */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Farm Progress Chart */}
            <div className="card">
              <div className="card-header">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <i className="fas fa-chart-bar mr-2"></i>
                  Farm Progress - Maendeleo ya Shamba
                </h2>
              </div>
              
              {dashboardData.stats.totalCrops > 0 ? (
                <div className="h-64">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-seedling text-gray-300 text-4xl mb-4"></i>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No crops yet - Hakuna mazao bado</p>
                  <Link to="/crops/new" className="btn-primary">
                    <i className="fas fa-plus mr-2"></i>
                    Add Your First Crop
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Crops */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <i className="fas fa-seedling mr-2"></i>
                    Recent Crops - Mazao ya hivi karibuni
                  </h2>
                  <Link to="/crops" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View All →
                  </Link>
                </div>
              </div>

              {dashboardData.crops.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.crops.map((crop) => (
                    <div key={crop._id} className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-200 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-seedling text-primary-600"></i>
                        </div>
                        <div>
                          <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{crop.name}</h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Planted: {formatDate(crop.plantingDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={getStatusBadge(crop.status)}>
                          {crop.status}
                        </span>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {getDaysUntil(crop.expectedHarvestDate)} days to harvest
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-seedling text-gray-300 text-3xl mb-3"></i>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No crops added yet</p>
                  <Link to="/crops/new" className="btn-primary">
                    <i className="fas fa-plus mr-2"></i>
                    Add Crop
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Tasks and Alerts */}
          <div className="space-y-8">
            
            {/* Overdue Tasks Alert */}
            {dashboardData.overdueTasks.length > 0 && (
              <div className={`border rounded-lg p-4 transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-red-900 border-red-700' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-3">
                  <i className="fas fa-exclamation-triangle text-red-600 mr-2"></i>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>Overdue Tasks!</h3>
                </div>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                  You have {dashboardData.overdueTasks.length} overdue task(s)
                </p>
                <Link to="/tasks" className="text-sm text-red-600 hover:text-red-700 font-medium">
                  View Tasks →
                </Link>
              </div>
            )}

            {/* Upcoming Tasks */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <i className="fas fa-tasks mr-2"></i>
                    Upcoming Tasks
                  </h2>
                  <Link to="/tasks" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View All →
                  </Link>
                </div>
              </div>

              {dashboardData.upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.upcomingTasks.map((task) => (
                    <div key={task._id} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-clock text-yellow-600 text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {task.description}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {task.cropId?.name} • Due: {formatDate(task.dueDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-check-circle text-gray-300 text-3xl mb-3"></i>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No upcoming tasks</p>
                  <Link to="/tasks/new" className="btn-primary">
                    <i className="fas fa-plus mr-2"></i>
                    Add Task
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <i className="fas fa-bolt mr-2"></i>
                  Quick Actions - Vitendo vya haraka
                </h2>
              </div>

              <div className="space-y-3">
                <Link
                  to="/crops/new"
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-primary-900 hover:bg-primary-800' 
                      : 'bg-primary-50 hover:bg-primary-100'
                  }`}
                >
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-seedling text-white"></i>
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add New Crop</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Ongeza zao jipya</p>
                  </div>
                </Link>

                <Link
                  to="/tasks/new"
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-yellow-900 hover:bg-yellow-800' 
                      : 'bg-yellow-50 hover:bg-yellow-100'
                  }`}
                >
                  <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-tasks text-white"></i>
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create Task</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Tengeneza shughuli</p>
                  </div>
                </Link>

                <Link
                  to="/profile"
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-blue-900 hover:bg-blue-800' 
                      : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user text-white"></i>
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Update Profile</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Sasisha wasifu</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;