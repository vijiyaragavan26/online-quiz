const express = require('express');
const router = express.Router();
const {
  getUserStats,
  getMyQuizzes,
  getPlatformStats
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getUserStats);
router.get('/my-quizzes', protect, getMyQuizzes);
router.get('/platform-stats', getPlatformStats);

module.exports = router;
