const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedDB = require('./config/seedData');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for all origins in development
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'QuizMaster Backend API'
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/attempts', require('./routes/attemptRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server.`
  });
});

// Central Error Handler
app.use(errorHandler);

// Start listening immediately
const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 QuizMaster Backend API is live on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`🔍 Health:   http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

// Connect to MongoDB asynchronously
connectDB().then((conn) => {
  if (conn) {
    seedDB();
  }
}).catch((err) => {
  console.warn('[Database] Async connection handler:', err.message);
});

module.exports = { app, server };
