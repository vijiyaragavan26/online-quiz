const { AttemptRepo, QuizRepo, QuestionRepo } = require('../config/dataService');

// @desc    Start a new quiz attempt
// @route   POST /api/attempts/start
// @access  Private
const startAttempt = async (req, res, next) => {
  try {
    const { quizId } = req.body;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required.'
      });
    }

    const quiz = await QuizRepo.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    if (!quiz.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'This quiz is not currently accepting responses.'
      });
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'This quiz does not have any questions yet.'
      });
    }

    const attempt = await AttemptRepo.create({
      userId: req.user._id,
      quizId: quiz._id,
      totalQuestions: quiz.questions.length
    });

    // Sanitize questions: NEVER leak correct answer or explanation
    const sanitizedQuestions = quiz.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      order: q.order
    }));

    res.status(201).json({
      success: true,
      attemptId: attempt._id,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        totalQuestions: quiz.questions.length,
        questions: sanitizedQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a quiz attempt and calculate score server-side
// @route   POST /api/attempts/:id/submit
// @access  Private
const submitAttempt = async (req, res, next) => {
  try {
    const attemptId = req.params.id;
    const { userAnswers = {}, timeTakenSeconds = 0 } = req.body;

    const attempt = await AttemptRepo.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt session not found.'
      });
    }

    const attemptUserId = attempt.user._id ? attempt.user._id.toString() : attempt.user.toString();
    if (attemptUserId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized attempt access.'
      });
    }

    if (attempt.isSubmitted) {
      return res.status(400).json({
        success: false,
        message: 'This quiz attempt has already been submitted.'
      });
    }

    const quizId = attempt.quiz._id ? attempt.quiz._id : attempt.quiz;
    const quiz = await QuizRepo.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Associated quiz no longer exists.'
      });
    }

    const questions = await QuestionRepo.findByQuiz(quiz._id);

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    const evaluatedAnswers = [];
    const reviewDetails = [];

    questions.forEach((q) => {
      const qIdStr = q._id.toString();
      const userSelected = userAnswers[qIdStr] !== undefined && userAnswers[qIdStr] !== null
        ? Number(userAnswers[qIdStr])
        : null;

      let isCorrect = false;

      if (userSelected === null || isNaN(userSelected) || userSelected === -1) {
        unansweredCount++;
      } else if (userSelected === q.correctAnswer) {
        correctCount++;
        isCorrect = true;
      } else {
        incorrectCount++;
      }

      evaluatedAnswers.push({
        question: q._id,
        selectedOption: userSelected,
        isCorrect
      });

      reviewDetails.push({
        questionId: q._id,
        questionText: q.questionText,
        options: q.options,
        selectedOption: userSelected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || ''
      });
    });

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = percentage >= (quiz.passingScore || 60);

    attempt.answers = evaluatedAnswers;
    attempt.totalQuestions = totalQuestions;
    attempt.correctAnswers = correctCount;
    attempt.incorrectAnswers = incorrectCount;
    attempt.unansweredCount = unansweredCount;
    attempt.score = correctCount;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.timeTakenSeconds = Number(timeTakenSeconds) || 0;
    attempt.isSubmitted = true;
    attempt.completedAt = new Date();

    await attempt.save();

    // Update Quiz participation count and avg score
    const currentCount = quiz.participationCount || 0;
    const currentAvg = quiz.averageScore || 0;
    const newCount = currentCount + 1;
    const newAvg = Math.round(((currentAvg * currentCount) + percentage) / newCount);

    quiz.participationCount = newCount;
    quiz.averageScore = newAvg;
    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully!',
      result: {
        attemptId: attempt._id,
        quizId: quiz._id,
        quizTitle: quiz.title,
        passingScore: quiz.passingScore,
        totalQuestions,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        unansweredCount,
        score: correctCount,
        percentage,
        passed,
        timeTakenSeconds: attempt.timeTakenSeconds,
        completedAt: attempt.completedAt,
        review: reviewDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's attempts history
// @route   GET /api/attempts/my-attempts
// @access  Private
const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await AttemptRepo.findByUser(req.user._id);

    res.status(200).json({
      success: true,
      count: attempts.length,
      attempts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get results of a specific completed attempt
// @route   GET /api/attempts/:id/results
// @access  Private
const getAttemptResults = async (req, res, next) => {
  try {
    const attempt = await AttemptRepo.findById(req.params.id);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found.'
      });
    }

    if (!attempt.isSubmitted) {
      return res.status(400).json({
        success: false,
        message: 'This quiz attempt has not been submitted yet.'
      });
    }

    const quizId = attempt.quiz && attempt.quiz._id ? attempt.quiz._id : attempt.quiz;
    const quiz = await QuizRepo.findById(quizId);

    const attemptUserId = attempt.user._id ? attempt.user._id.toString() : attempt.user.toString();
    const isOwner = attemptUserId === req.user._id.toString();
    const creatorId = quiz && quiz.creator && quiz.creator._id ? quiz.creator._id.toString() : quiz?.creator?.toString();
    const isCreator = creatorId === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this quiz result.'
      });
    }

    const questions = await QuestionRepo.findByQuiz(quiz._id);

    const answerMap = {};
    if (attempt.answers && Array.isArray(attempt.answers)) {
      attempt.answers.forEach(a => {
        const qId = a.question._id ? a.question._id.toString() : a.question.toString();
        answerMap[qId] = a.selectedOption;
      });
    }

    const review = questions.map(q => {
      const selected = answerMap[q._id.toString()] !== undefined ? answerMap[q._id.toString()] : null;
      const isCorrect = selected === q.correctAnswer;
      return {
        questionId: q._id,
        questionText: q.questionText,
        options: q.options,
        selectedOption: selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || ''
      };
    });

    res.status(200).json({
      success: true,
      result: {
        attemptId: attempt._id,
        quizId: quiz._id,
        quizTitle: quiz.title,
        category: quiz.category,
        difficulty: quiz.difficulty,
        passingScore: quiz.passingScore,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        incorrectAnswers: attempt.incorrectAnswers,
        unansweredCount: attempt.unansweredCount,
        score: attempt.score,
        percentage: attempt.percentage,
        passed: attempt.passed,
        timeTakenSeconds: attempt.timeTakenSeconds,
        completedAt: attempt.completedAt,
        startedAt: attempt.startedAt,
        review
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startAttempt,
  submitAttempt,
  getMyAttempts,
  getAttemptResults
};
