const os = require('os');
const mongoose = require('mongoose');

// Performance metrics storage
const metrics = {
  requests: {
    total: 0,
    byMethod: {},
    byRoute: {},
    byStatus: {}
  },
  responseTime: {
    min: Infinity,
    max: 0,
    avg: 0,
    samples: []
  },
  errors: {
    total: 0,
    byType: {},
    byRoute: {}
  },
  memory: {
    samples: []
  },
  database: {
    connections: 0,
    operations: 0,
    slowQueries: []
  }
};

// Update response time metrics
const updateResponseTime = (duration) => {
  metrics.responseTime.samples.push(duration);
  
  // Keep only last 1000 samples
  if (metrics.responseTime.samples.length > 1000) {
    metrics.responseTime.samples.shift();
  }
  
  metrics.responseTime.min = Math.min(metrics.responseTime.min, duration);
  metrics.responseTime.max = Math.max(metrics.responseTime.max, duration);
  metrics.responseTime.avg = metrics.responseTime.samples.reduce((a, b) => a + b, 0) / metrics.responseTime.samples.length;
};

// Update request metrics
const updateRequestMetrics = (method, route, statusCode) => {
  metrics.requests.total++;
  
  // By method
  metrics.requests.byMethod[method] = (metrics.requests.byMethod[method] || 0) + 1;
  
  // By route
  metrics.requests.byRoute[route] = (metrics.requests.byRoute[route] || 0) + 1;
  
  // By status
  metrics.requests.byStatus[statusCode] = (metrics.requests.byStatus[statusCode] || 0) + 1;
};

// Update error metrics
const updateErrorMetrics = (error, route) => {
  metrics.errors.total++;
  
  const errorType = error.name || 'Unknown';
  metrics.errors.byType[errorType] = (metrics.errors.byType[errorType] || 0) + 1;
  metrics.errors.byRoute[route] = (metrics.errors.byRoute[route] || 0) + 1;
};

// Update memory metrics
const updateMemoryMetrics = () => {
  const memUsage = process.memoryUsage();
  metrics.memory.samples.push({
    timestamp: Date.now(),
    rss: memUsage.rss,
    heapUsed: memUsage.heapUsed,
    heapTotal: memUsage.heapTotal,
    external: memUsage.external
  });
  
  // Keep only last 100 samples
  if (metrics.memory.samples.length > 100) {
    metrics.memory.samples.shift();
  }
};

// Update database metrics
const updateDatabaseMetrics = (operation, duration) => {
  metrics.database.operations++;
  metrics.database.connections = mongoose.connection.readyState === 1 ? 1 : 0;
  
  // Track slow queries (>100ms)
  if (duration > 100) {
    metrics.database.slowQueries.push({
      operation,
      duration,
      timestamp: Date.now()
    });
    
    // Keep only last 50 slow queries
    if (metrics.database.slowQueries.length > 50) {
      metrics.database.slowQueries.shift();
    }
  }
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  // Override res.send to capture response time
  res.send = function(data) {
    const duration = Date.now() - start;
    updateResponseTime(duration);
    updateRequestMetrics(req.method, req.route?.path || req.path, res.statusCode);
    
    // Track errors
    if (res.statusCode >= 400) {
      updateErrorMetrics({ name: 'HTTPError', message: `Status ${res.statusCode}` }, req.route?.path || req.path);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Memory monitoring (runs every 30 seconds)
const startMemoryMonitoring = () => {
  setInterval(() => {
    updateMemoryMetrics();
  }, 30000);
};

// Health check endpoint
const healthCheck = (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      connections: metrics.database.connections
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      cpuUsage: os.loadavg(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem()
    }
  };
  
  // Check if system is healthy
  const memoryUsage = health.memory.heapUsed / health.memory.heapTotal;
  if (memoryUsage > 0.9) {
    health.status = 'warning';
    health.memory.warning = 'High memory usage';
  }
  
  if (health.database.status !== 'connected') {
    health.status = 'unhealthy';
  }
  
  const statusCode = health.status === 'healthy' ? 200 : health.status === 'warning' ? 200 : 503;
  
  res.status(statusCode).json(health);
};

// Metrics endpoint
const getMetrics = (req, res) => {
  const currentMemory = process.memoryUsage();
  const currentMetrics = {
    ...metrics,
    current: {
      memory: currentMemory,
      uptime: process.uptime(),
      database: {
        connections: mongoose.connection.readyState === 1 ? 1 : 0,
        readyState: mongoose.connection.readyState
      }
    }
  };
  
  res.json(currentMetrics);
};

// Database monitoring middleware
const databaseMonitor = (req, res, next) => {
  const start = Date.now();
  
  // Monitor database operations
  const originalQuery = mongoose.Query.prototype.exec;
  mongoose.Query.prototype.exec = function() {
    const queryStart = Date.now();
    return originalQuery.apply(this, arguments).then(result => {
      const duration = Date.now() - queryStart;
      updateDatabaseMetrics(this.op, duration);
      return result;
    });
  };
  
  next();
};

// Error tracking middleware
const errorTracker = (err, req, res, next) => {
  updateErrorMetrics(err, req.route?.path || req.path);
  next(err);
};

// Rate limiting for monitoring endpoints
const rateLimit = require('express-rate-limit');

const monitoringRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests to monitoring endpoints'
  }
});

module.exports = {
  performanceMonitor,
  databaseMonitor,
  errorTracker,
  healthCheck,
  getMetrics,
  startMemoryMonitoring,
  monitoringRateLimit,
  metrics
}; 