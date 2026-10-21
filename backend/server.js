const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student360 API is running',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    database: 'Connected (MongoDB)',
    scheduler: 'Active (6-hour interval)'
  });
});

// Main Dashboard Aggregate Route
const { getMainDashboard } = require('./controllers/reportController');
const { protect } = require('./middleware/authMiddleware');
app.get('/api/dashboard', protect, getMainDashboard);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/polls', require('./routes/pollRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/integrations', require('./routes/integrationRoutes'));

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  // Initialize periodic background sync worker (runs every 6 hours)
  const schedulerService = require('./services/schedulerService');
  schedulerService.initScheduler(6);
});

module.exports = server;
