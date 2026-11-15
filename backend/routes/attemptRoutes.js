const express = require('express');
const router = express.Router();
const {
  startAttempt,
  submitAttempt,
  getMyAttempts,
  getAttemptResults
} = require('../controllers/attemptController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, startAttempt);
router.post('/:id/submit', protect, submitAttempt);
router.get('/my-attempts', protect, getMyAttempts);
router.get('/:id/results', protect, getAttemptResults);

module.exports = router;
