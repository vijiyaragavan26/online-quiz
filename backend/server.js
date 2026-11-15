const express = require('express');
const cors = require('cors');
const path = require('path');
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

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/attempts', require('./routes/attemptRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Serve Frontend Static Build if present
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

// For any non-API route, send index.html (SPA client-side routing)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(frontendDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({
        success: false,
        message: `Endpoint ${req.originalUrl} not found.`
      });
    }
  });
});

// Central Error Handler
app.use(errorHandler);

// Start listening immediately
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🚀 QuizMaster Full-Stack App is live on port ${PORT}`);
  console.log(`🌐 Web UI:   http://localhost:${PORT}`);
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
