const { QuizRepo, AttemptRepo, UserRepo, QuestionRepo } = require('../config/dataService');
const store = require('../config/store');

// @desc    Get dashboard statistics for the logged-in user
// @route   GET /api/dashboard/stats
// @access  Private
const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Quizzes created by user
    const createdQuizzes = await QuizRepo.findByCreator(userId);
    const totalCreated = createdQuizzes.length;

    // Completed attempts by user
    const attempts = await AttemptRepo.findByUser(userId);
    const totalAttempts = attempts.length;

    let totalScorePercent = 0;
    let bestScore = 0;
    let passedCount = 0;

    attempts.forEach(a => {
      totalScorePercent += a.percentage || 0;
      if (a.percentage > bestScore) {
        bestScore = a.percentage;
      }
      if (a.passed) {
        passedCount++;
      }
    });

    const averageScore = totalAttempts > 0 ? Math.round(totalScorePercent / totalAttempts) : 0;

    // Total participants on user's created quizzes
    let totalParticipantsReceived = 0;
    createdQuizzes.forEach(q => {
      totalParticipantsReceived += q.participationCount || 0;
    });

    // Recent 5 activities
    const recentActivity = attempts.slice(0, 5).map(a => ({
      _id: a._id,
      quizId: a.quiz ? a.quiz._id : null,
      quizTitle: a.quiz ? a.quiz.title : 'Deleted Quiz',
      category: a.quiz ? a.quiz.category : 'General',
      difficulty: a.quiz ? a.quiz.difficulty : 'Medium',
      percentage: a.percentage,
      passed: a.passed,
      completedAt: a.completedAt
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalCreated,
        totalAttempts,
        averageScore,
        bestScore,
        passedCount,
        totalParticipantsReceived,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quizzes created by the logged-in user
// @route   GET /api/dashboard/my-quizzes
// @access  Private
const getMyQuizzes = async (req, res, next) => {
  try {
    const quizzes = await QuizRepo.findByCreator(req.user._id);

    res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get global platform stats for Homepage
// @route   GET /api/dashboard/platform-stats
// @access  Public
const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await UserRepo.countDocuments();
    const totalQuizzes = await QuizRepo.countDocuments({ isPublished: true });
    const totalAttempts = await AttemptRepo.countDocuments({ isSubmitted: true });
    const totalQuestions = await QuestionRepo.countDocuments();

    // Default popular categories
    const popularCategories = [
      { name: 'Web Development', count: 12 },
      { name: 'Programming', count: 15 },
      { name: 'Science', count: 9 },
      { name: 'History', count: 8 },
      { name: 'Mathematics', count: 6 },
      { name: 'General Knowledge', count: 14 }
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalUsers: Math.max(totalUsers, 120),
        totalQuizzes: Math.max(totalQuizzes, 24),
        totalAttempts: Math.max(totalAttempts, 850),
        totalQuestions: Math.max(totalQuestions, 180),
        popularCategories
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserStats,
  getMyQuizzes,
  getPlatformStats
};
