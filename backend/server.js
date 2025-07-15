const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const cropRoutes = require('./routes/crops');
const taskRoutes = require('./routes/tasks');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean), // remove any falsy values
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'FarmLink API is running successfully! 🌱',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      crops: '/api/crops',
      tasks: '/api/tasks'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/tasks', taskRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found`,
    message: 'Please check the API documentation for available endpoints'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Global Error Handler:', error.message || error);

  let status = 500;
  let response = {
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  };

  // Handle specific error types
  if (error.name === 'ValidationError') {
    status = 400;
    response = {
      error: 'Validation Error',
      details: Object.values(error.errors).map(e => e.message)
    };
  }

  if (error.code && error.code === 11000) {
    status = 400;
    const field = Object.keys(error.keyValue)[0];
    response = { error: `${field} already exists`, field };
  }

  if (error.name === 'JsonWebTokenError') {
    status = 401;
    response = { error: 'Invalid token' };
  }

  if (error.name === 'TokenExpiredError') {
    status = 401;
    response = { error: 'Token has expired' };
  }

  res.status(status).json(response);
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Connected to database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message || error);
    process.exit(1); // Exit with failure
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message || error);
    process.exit(1);
  }
};

startServer();

module.exports = app;