const express = require('express');
const router = express.Router();
const { 
  healthCheck, 
  getMetrics, 
  monitoringRateLimit 
} = require('../middleware/monitoring');
const { generateReport } = require('../config/monitoring');

// Health check endpoint
router.get('/health', healthCheck);

// Metrics endpoint (rate limited)
router.get('/metrics', monitoringRateLimit, getMetrics);

// System status endpoint
router.get('/status', monitoringRateLimit, (req, res) => {
  const status = {
    service: 'FarmLink Backend',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: process.memoryUsage().heapUsed,
      total: process.memoryUsage().heapTotal,
      external: process.memoryUsage().external,
      rss: process.memoryUsage().rss
    },
    database: {
      status: 'connected', // This will be updated by monitoring middleware
      readyState: 1
    }
  };
  
  res.json({
    success: true,
    message: 'System status retrieved successfully',
    data: status
  });
});

// Performance dashboard endpoint
router.get('/performance', monitoringRateLimit, (req, res) => {
  const { metrics } = require('../middleware/monitoring');
  
  const performance = {
    requests: {
      total: metrics.requests.total,
      byMethod: metrics.requests.byMethod,
      byStatus: metrics.requests.byStatus
    },
    responseTime: {
      min: metrics.responseTime.min === Infinity ? 0 : metrics.responseTime.min,
      max: metrics.responseTime.max,
      avg: metrics.responseTime.avg
    },
    errors: {
      total: metrics.errors.total,
      byType: metrics.errors.byType
    },
    database: {
      operations: metrics.database.operations,
      slowQueries: metrics.database.slowQueries.length
    }
  };
  
  res.json({
    success: true,
    message: 'Performance metrics retrieved successfully',
    data: performance
  });
});

// Error summary endpoint
router.get('/errors', monitoringRateLimit, (req, res) => {
  const { metrics } = require('../middleware/monitoring');
  
  const errorSummary = {
    total: metrics.errors.total,
    byType: metrics.errors.byType,
    byRoute: metrics.errors.byRoute,
    recentErrors: metrics.errors.byRoute // This could be enhanced with timestamps
  };
  
  res.json({
    success: true,
    message: 'Error summary retrieved successfully',
    data: errorSummary
  });
});

// Comprehensive report endpoint
router.get('/report', monitoringRateLimit, (req, res) => {
  const { metrics } = require('../middleware/monitoring');
  
  try {
    const report = generateReport(metrics);
    
    res.json({
      success: true,
      message: 'Monitoring report generated successfully',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating monitoring report',
      error: error.message
    });
  }
});

module.exports = router; 