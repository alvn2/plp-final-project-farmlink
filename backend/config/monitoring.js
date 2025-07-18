// Monitoring configuration
const monitoringConfig = {
  // Performance thresholds
  thresholds: {
    responseTime: {
      warning: 1000, // 1 second
      critical: 3000  // 3 seconds
    },
    memory: {
      warning: 0.8,   // 80% of heap
      critical: 0.9   // 90% of heap
    },
    errorRate: {
      warning: 0.05,  // 5% error rate
      critical: 0.1   // 10% error rate
    },
    database: {
      slowQuery: 100, // 100ms
      connectionTimeout: 5000 // 5 seconds
    }
  },

  // Alert settings
  alerts: {
    enabled: process.env.ENABLE_ALERTS === 'true',
    channels: {
      email: {
        enabled: process.env.EMAIL_ALERTS === 'true',
        recipients: process.env.ALERT_EMAILS?.split(',') || []
      },
      slack: {
        enabled: process.env.SLACK_ALERTS === 'true',
        webhook: process.env.SLACK_WEBHOOK_URL
      }
    }
  },

  // Dashboard settings
  dashboard: {
    refreshInterval: 30000, // 30 seconds
    historyRetention: 24 * 60 * 60 * 1000, // 24 hours
    maxDataPoints: 1000
  },

  // Logging settings
  logging: {
    level: process.env.MONITORING_LOG_LEVEL || 'info',
    retention: {
      days: 30,
      maxSize: '100MB'
    }
  },

  // Health check settings
  healthCheck: {
    interval: 30000, // 30 seconds
    timeout: 5000,   // 5 seconds
    retries: 3
  }
};

// Check if system is healthy based on metrics
const checkSystemHealth = (metrics) => {
  const health = {
    status: 'healthy',
    warnings: [],
    critical: []
  };

  // Check response time
  if (metrics.responseTime.avg > monitoringConfig.thresholds.responseTime.critical) {
    health.status = 'critical';
    health.critical.push(`Average response time (${metrics.responseTime.avg}ms) exceeds critical threshold`);
  } else if (metrics.responseTime.avg > monitoringConfig.thresholds.responseTime.warning) {
    health.status = health.status === 'critical' ? 'critical' : 'warning';
    health.warnings.push(`Average response time (${metrics.responseTime.avg}ms) exceeds warning threshold`);
  }

  // Check error rate
  const errorRate = metrics.errors.total / Math.max(metrics.requests.total, 1);
  if (errorRate > monitoringConfig.thresholds.errorRate.critical) {
    health.status = 'critical';
    health.critical.push(`Error rate (${(errorRate * 100).toFixed(2)}%) exceeds critical threshold`);
  } else if (errorRate > monitoringConfig.thresholds.errorRate.warning) {
    health.status = health.status === 'critical' ? 'critical' : 'warning';
    health.warnings.push(`Error rate (${(errorRate * 100).toFixed(2)}%) exceeds warning threshold`);
  }

  // Check memory usage
  const currentMemory = process.memoryUsage();
  const memoryUsage = currentMemory.heapUsed / currentMemory.heapTotal;
  if (memoryUsage > monitoringConfig.thresholds.memory.critical) {
    health.status = 'critical';
    health.critical.push(`Memory usage (${(memoryUsage * 100).toFixed(2)}%) exceeds critical threshold`);
  } else if (memoryUsage > monitoringConfig.thresholds.memory.warning) {
    health.status = health.status === 'critical' ? 'critical' : 'warning';
    health.warnings.push(`Memory usage (${(memoryUsage * 100).toFixed(2)}%) exceeds warning threshold`);
  }

  return health;
};

// Generate monitoring report
const generateReport = (metrics) => {
  const health = checkSystemHealth(metrics);
  const currentMemory = process.memoryUsage();
  
  return {
    timestamp: new Date().toISOString(),
    health,
    summary: {
      uptime: process.uptime(),
      totalRequests: metrics.requests.total,
      totalErrors: metrics.errors.total,
      errorRate: metrics.requests.total > 0 ? (metrics.errors.total / metrics.requests.total * 100).toFixed(2) : 0,
      avgResponseTime: metrics.responseTime.avg.toFixed(2),
      memoryUsage: {
        used: (currentMemory.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
        total: (currentMemory.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
        percentage: ((currentMemory.heapUsed / currentMemory.heapTotal) * 100).toFixed(2) + '%'
      },
      databaseOperations: metrics.database.operations,
      slowQueries: metrics.database.slowQueries.length
    },
    topRoutes: Object.entries(metrics.requests.byRoute)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([route, count]) => ({ route, count })),
    topErrors: Object.entries(metrics.errors.byType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }))
  };
};

module.exports = {
  monitoringConfig,
  checkSystemHealth,
  generateReport
}; 