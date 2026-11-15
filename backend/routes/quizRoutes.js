const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz
} = require('../controllers/quizController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.route('/')
  .get(optionalAuth, getQuizzes)
  .post(protect, createQuiz);

router.route('/:id')
  .get(optionalAuth, getQuizById)
  .put(protect, updateQuiz)
  .delete(protect, deleteQuiz);

module.exports = router;
