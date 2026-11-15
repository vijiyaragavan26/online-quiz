const { QuizRepo } = require('../config/dataService');

// @desc    Create a new quiz with questions
// @route   POST /api/quizzes
// @access  Private
const createQuiz = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      timeLimit,
      passingScore,
      isPublic,
      isPublished,
      questions
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category.'
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A quiz must contain at least one question.'
      });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !q.questionText.trim()) {
        return res.status(400).json({
          success: false,
          message: `Question #${i + 1} is missing question text.`
        });
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        return res.status(400).json({
          success: false,
          message: `Question #${i + 1} must have exactly 4 options.`
        });
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j] || !q.options[j].trim()) {
          return res.status(400).json({
            success: false,
            message: `Question #${i + 1}, Option ${String.fromCharCode(65 + j)} cannot be empty.`
          });
        }
      }
      if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer > 3) {
        return res.status(400).json({
          success: false,
          message: `Question #${i + 1} must specify a valid correct answer (Option A, B, C, or D).`
        });
      }
    }

    const quizData = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      difficulty: difficulty || 'Medium',
      timeLimit: Number(timeLimit) || 10,
      passingScore: Number(passingScore) || 60,
      isPublic: isPublic !== undefined ? isPublic : true,
      isPublished: isPublished !== undefined ? isPublished : true,
      creator: req.user._id
    };

    const quiz = await QuizRepo.create(quizData, questions);

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully!',
      quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all published quizzes with filter, search, sort, pagination
// @route   GET /api/quizzes
// @access  Public
const getQuizzes = async (req, res, next) => {
  try {
    const {
      search,
      category,
      difficulty,
      sort,
      page = 1,
      limit = 9,
      creator
    } = req.query;

    const callerId = req.user ? req.user._id : null;

    const { total, quizzes } = await QuizRepo.find({
      search,
      category,
      difficulty,
      sort,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      creator,
      callerId
    });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      totalQuizzes: total,
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      currentPage: parseInt(page, 10),
      quizzes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz by ID
// @route   GET /api/quizzes/:id
// @access  Public (sensitive fields stripped for non-creators)
const getQuizById = async (req, res, next) => {
  try {
    const quiz = await QuizRepo.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    const creatorId = quiz.creator && quiz.creator._id ? quiz.creator._id.toString() : quiz.creator.toString();
    const isCreator = req.user && req.user._id.toString() === creatorId;

    if (!quiz.isPublished && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'This quiz is currently private or unpublished.'
      });
    }

    // Clone and sanitize questions if not creator
    let sanitizedQuestions = quiz.questions.map(q => {
      if (isCreator) {
        return q;
      }
      return {
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        order: q.order
        // correctAnswer and explanation omitted!
      };
    });

    res.status(200).json({
      success: true,
      isCreator,
      quiz: {
        ...quiz,
        questions: sanitizedQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a quiz and its questions
// @route   PUT /api/quizzes/:id
// @access  Private (Owner only)
const updateQuiz = async (req, res, next) => {
  try {
    let quiz = await QuizRepo.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    const creatorId = quiz.creator && quiz.creator._id ? quiz.creator._id.toString() : quiz.creator.toString();
    if (creatorId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this quiz.'
      });
    }

    const {
      title,
      description,
      category,
      difficulty,
      timeLimit,
      passingScore,
      isPublic,
      isPublished,
      questions
    } = req.body;

    const quizData = {
      title: title || quiz.title,
      description: description || quiz.description,
      category: category || quiz.category,
      difficulty: difficulty || quiz.difficulty,
      timeLimit: timeLimit !== undefined ? Number(timeLimit) : quiz.timeLimit,
      passingScore: passingScore !== undefined ? Number(passingScore) : quiz.passingScore,
      isPublic: isPublic !== undefined ? isPublic : quiz.isPublic,
      isPublished: isPublished !== undefined ? isPublished : quiz.isPublished
    };

    const updatedQuiz = await QuizRepo.update(req.params.id, quizData, questions);

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully!',
      quiz: updatedQuiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Owner only)
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await QuizRepo.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    const creatorId = quiz.creator && quiz.creator._id ? quiz.creator._id.toString() : quiz.creator.toString();
    if (creatorId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this quiz.'
      });
    }

    await QuizRepo.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Quiz and all associated data deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz
};
