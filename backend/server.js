const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const cropRoutes = require('./routes/crops');
const taskRoutes = require('./routes/tasks');
const monitoringRoutes = require('./routes/monitoring');
const aiChatRoutes = require('./routes/aichat');

// Import middleware
const { globalErrorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');
const { 
  performanceMonitor, 
  databaseMonitor, 
  errorTracker, 
  startMemoryMonitoring 
} = require('./middleware/monitoring');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const connectDB = async() => {
  try {
    const mongoURI = process.env.NODE_ENV === 'test'
      ? process.env.MONGODB_URI_TEST
      : process.env.MONGO_URI;

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    } else {
      throw error; // Let the test runner handle the error
    }
  }
};

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
  'https://farmlinkkenya.vercel.app',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
// Handle preflight requests for all routes
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Monitoring middleware
app.use(performanceMonitor);
app.use(databaseMonitor);

// Logging middleware
app.use(morgan('combined'));
app.use(requestLogger);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/tasks', taskRoutes);

// Monitoring routes
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/ai-chat', aiChatRoutes);

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error tracking middleware
app.use(errorTracker);

// Global error handling middleware
app.use(globalErrorHandler);

// Graceful shutdown
process.on('SIGTERM', async() => {
  console.log('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async() => {
  console.log('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

// Start memory monitoring
startMemoryMonitoring();

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`FarmLink API server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Monitoring endpoints available at /api/monitoring`);
  });
}

module.exports = app;
