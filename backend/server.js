const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database (skip in test environment as tests handle their own connection)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Initialize Cron Jobs (only in non-test environment)
if (process.env.NODE_ENV !== 'test') {
  const startSlaMonitor = require('./cron/slaMonitor');
  startSlaMonitor();
  const startPerformanceMonitor = require('./cron/performanceMonitor');
  startPerformanceMonitor();
}

const app = express();

// ----- MIDDLEWARE -----
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:6174',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Increase payload limits for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----- ROUTES -----
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/location', require('./routes/locationRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/constructor', require('./routes/constructorRoutes'));
app.use('/api/superadmin', require('./routes/superAdminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/citizen', require('./routes/citizenRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'RCMS API is running', timestamp: new Date() });
});

// ----- ERROR HANDLER -----
app.use(require('./middleware/errorHandler'));

// ----- START SERVER -----
const PORT = process.env.PORT || 5000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 RCMS Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health\n`);
  });
}

// Export app for testing
module.exports = app;
