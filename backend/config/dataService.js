const mongoose = require('mongoose');
const store = require('./store');
const UserModel = require('../models/User');
const QuizModel = require('../models/Quiz');
const QuestionModel = require('../models/Question');
const AttemptModel = require('../models/QuizAttempt');
const bcrypt = require('bcryptjs');

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// --- USER OPERATIONS ---
const UserRepo = {
  async findOneByEmail(email, includePassword = false) {
    if (isDbConnected()) {
      const q = UserModel.findOne({ email: email.toLowerCase() });
      if (includePassword) q.select('+password');
      return await q;
    }
    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    return { ...user };
  },

  async findById(id) {
    if (isDbConnected()) {
      return await UserModel.findById(id).select('-password');
    }
    const user = store.users.find(u => u._id.toString() === id.toString());
    if (!user) return null;
    const { password, ...safeUser } = user;
    return {
      ...safeUser,
      async save() {
        const idx = store.users.findIndex(u => u._id.toString() === id.toString());
        if (idx !== -1) {
          store.users[idx] = { ...store.users[idx], ...this };
        }
        return this;
      }
    };
  },

  async create({ name, email, password, bio, avatar, role }) {
    if (isDbConnected()) {
      return await UserModel.create({ name, email, password, bio, avatar, role });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      _id: store.generateId(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      bio: bio || 'Quiz enthusiast and lifelong learner.',
      avatar: avatar || '',
      role: role || 'user',
      createdAt: new Date(),
      async matchPassword(entered) {
        return await bcrypt.compare(entered, this.password);
      }
    };
    store.users.push(newUser);
    return newUser;
  },

  async countDocuments() {
    if (isDbConnected()) return await UserModel.countDocuments();
    return store.users.length;
  }
};

// --- QUIZ OPERATIONS ---
const QuizRepo = {
  async find({ search, category, difficulty, sort, page = 1, limit = 9, creator, callerId }) {
    if (isDbConnected()) {
      const query = { isPublished: true, isPublic: true };
      if (creator) {
        query.creator = creator;
        if (callerId && callerId.toString() === creator.toString()) {
          delete query.isPublished;
          delete query.isPublic;
        }
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }
      if (category && category !== 'All') query.category = category;
      if (difficulty && difficulty !== 'All') query.difficulty = difficulty;

      let sortOption = { createdAt: -1 };
      if (sort === 'oldest') sortOption = { createdAt: 1 };
      if (sort === 'popular') sortOption = { participationCount: -1 };
      if (sort === 'time_asc') sortOption = { timeLimit: 1 };
      if (sort === 'time_desc') sortOption = { timeLimit: -1 };
      if (sort === 'title_asc') sortOption = { title: 1 };

      const skip = (page - 1) * limit;
      const total = await QuizModel.countDocuments(query);
      const quizzes = await QuizModel.find(query)
        .populate('creator', 'name avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .select('-questions');

      return { total, quizzes };
    }

    // Memory Store Query
    let filtered = [...store.quizzes];

    if (creator) {
      filtered = filtered.filter(q => q.creator.toString() === creator.toString());
      if (!callerId || callerId.toString() !== creator.toString()) {
        filtered = filtered.filter(q => q.isPublished && q.isPublic);
      }
    } else {
      filtered = filtered.filter(q => q.isPublished && q.isPublic);
    }

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        q =>
          q.title.toLowerCase().includes(s) ||
          q.description.toLowerCase().includes(s) ||
          q.category.toLowerCase().includes(s)
      );
    }

    if (category && category !== 'All') {
      filtered = filtered.filter(q => q.category.toLowerCase() === category.toLowerCase());
    }

    if (difficulty && difficulty !== 'All') {
      filtered = filtered.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'popular') return (b.participationCount || 0) - (a.participationCount || 0);
      if (sort === 'time_asc') return (a.timeLimit || 0) - (b.timeLimit || 0);
      if (sort === 'time_desc') return (b.timeLimit || 0) - (a.timeLimit || 0);
      if (sort === 'title_asc') return a.title.localeCompare(b.title);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const total = filtered.length;
    const skip = (page - 1) * limit;
    const paged = filtered.slice(skip, skip + limit);

    // Attach creator name and avatar
    const populated = paged.map(q => {
      const u = store.users.find(usr => usr._id.toString() === q.creator.toString());
      return {
        ...q,
        creator: u ? { _id: u._id, name: u.name, avatar: u.avatar } : { name: 'QuizMaster' }
      };
    });

    return { total, quizzes: populated };
  },

  async findById(id) {
    if (isDbConnected()) {
      return await QuizModel.findById(id)
        .populate('creator', 'name avatar')
        .populate({ path: 'questions', options: { sort: { order: 1 } } });
    }

    const quiz = store.quizzes.find(q => q._id.toString() === id.toString());
    if (!quiz) return null;

    const u = store.users.find(usr => usr._id.toString() === quiz.creator.toString());
    const questions = store.questions
      .filter(qn => qn.quiz.toString() === id.toString())
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return {
      ...quiz,
      creator: u ? { _id: u._id, name: u.name, avatar: u.avatar } : { name: 'QuizMaster' },
      questions,
      async save() {
        const idx = store.quizzes.findIndex(q => q._id.toString() === id.toString());
        if (idx !== -1) {
          store.quizzes[idx] = { ...store.quizzes[idx], ...this };
        }
        return this;
      }
    };
  },

  async create(quizData, questionsData) {
    if (isDbConnected()) {
      const quiz = new QuizModel({
        ...quizData,
        totalQuestions: questionsData.length
      });
      await quiz.save();

      const createdQuestions = await Promise.all(
        questionsData.map((q, idx) =>
          QuestionModel.create({
            quiz: quiz._id,
            questionText: q.questionText.trim(),
            options: q.options.map(opt => opt.trim()),
            correctAnswer: Number(q.correctAnswer),
            explanation: q.explanation ? q.explanation.trim() : '',
            order: idx
          })
        )
      );

      quiz.questions = createdQuestions.map(doc => doc._id);
      await quiz.save();
      return quiz;
    }

    const quizId = store.generateId();
    const questionIds = [];

    questionsData.forEach((q, idx) => {
      const qId = store.generateId();
      questionIds.push(qId);
      store.questions.push({
        _id: qId,
        quiz: quizId,
        questionText: q.questionText.trim(),
        options: q.options.map(opt => opt.trim()),
        correctAnswer: Number(q.correctAnswer),
        explanation: q.explanation ? q.explanation.trim() : '',
        order: idx,
        createdAt: new Date()
      });
    });

    const newQuiz = {
      _id: quizId,
      ...quizData,
      questions: questionIds,
      totalQuestions: questionIds.length,
      participationCount: 0,
      averageScore: 0,
      createdAt: new Date()
    };

    store.quizzes.unshift(newQuiz);
    return newQuiz;
  },

  async update(id, quizData, questionsData) {
    if (isDbConnected()) {
      let quiz = await QuizModel.findById(id);
      if (!quiz) return null;

      Object.assign(quiz, quizData);

      if (questionsData && Array.isArray(questionsData)) {
        await QuestionModel.deleteMany({ quiz: quiz._id });
        const newQuestions = await Promise.all(
          questionsData.map((q, idx) =>
            QuestionModel.create({
              quiz: quiz._id,
              questionText: q.questionText.trim(),
              options: q.options.map(opt => opt.trim()),
              correctAnswer: Number(q.correctAnswer),
              explanation: q.explanation ? q.explanation.trim() : '',
              order: idx
            })
          )
        );
        quiz.questions = newQuestions.map(q => q._id);
        quiz.totalQuestions = newQuestions.length;
      }
      await quiz.save();
      return quiz;
    }

    const idx = store.quizzes.findIndex(q => q._id.toString() === id.toString());
    if (idx === -1) return null;

    store.quizzes[idx] = { ...store.quizzes[idx], ...quizData };

    if (questionsData && Array.isArray(questionsData)) {
      // Remove old
      store.questions = store.questions.filter(qn => qn.quiz.toString() !== id.toString());

      const questionIds = [];
      questionsData.forEach((q, qidx) => {
        const qId = store.generateId();
        questionIds.push(qId);
        store.questions.push({
          _id: qId,
          quiz: id,
          questionText: q.questionText.trim(),
          options: q.options.map(opt => opt.trim()),
          correctAnswer: Number(q.correctAnswer),
          explanation: q.explanation ? q.explanation.trim() : '',
          order: qidx,
          createdAt: new Date()
        });
      });

      store.quizzes[idx].questions = questionIds;
      store.quizzes[idx].totalQuestions = questionIds.length;
    }

    return store.quizzes[idx];
  },

  async delete(id) {
    if (isDbConnected()) {
      await QuestionModel.deleteMany({ quiz: id });
      await AttemptModel.deleteMany({ quiz: id });
      await QuizModel.findByIdAndDelete(id);
      return true;
    }

    store.quizzes = store.quizzes.filter(q => q._id.toString() !== id.toString());
    store.questions = store.questions.filter(q => q.quiz.toString() !== id.toString());
    store.attempts = store.attempts.filter(a => a.quiz.toString() !== id.toString());
    return true;
  },

  async findByCreator(creatorId) {
    if (isDbConnected()) {
      return await QuizModel.find({ creator: creatorId }).sort({ createdAt: -1 });
    }
    return store.quizzes
      .filter(q => q.creator.toString() === creatorId.toString())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async countDocuments(query = {}) {
    if (isDbConnected()) return await QuizModel.countDocuments(query);
    if (query.isPublished) return store.quizzes.filter(q => q.isPublished).length;
    return store.quizzes.length;
  }
};

// --- ATTEMPTS OPERATIONS ---
const AttemptRepo = {
  async create({ userId, quizId, totalQuestions }) {
    if (isDbConnected()) {
      return await AttemptModel.create({
        user: userId,
        quiz: quizId,
        totalQuestions,
        startedAt: new Date(),
        isSubmitted: false
      });
    }

    const attempt = {
      _id: store.generateId(),
      user: userId,
      quiz: quizId,
      totalQuestions,
      answers: [],
      score: 0,
      percentage: 0,
      passed: false,
      timeTakenSeconds: 0,
      isSubmitted: false,
      startedAt: new Date()
    };
    store.attempts.push(attempt);
    return attempt;
  },

  async findById(id) {
    if (isDbConnected()) {
      return await AttemptModel.findById(id).populate('quiz');
    }
    const attempt = store.attempts.find(a => a._id.toString() === id.toString());
    if (!attempt) return null;
    const quiz = store.quizzes.find(q => q._id.toString() === attempt.quiz.toString());
    return {
      ...attempt,
      quiz,
      async save() {
        const idx = store.attempts.findIndex(a => a._id.toString() === id.toString());
        if (idx !== -1) {
          store.attempts[idx] = { ...store.attempts[idx], ...this };
        }
        return this;
      }
    };
  },

  async findByUser(userId) {
    if (isDbConnected()) {
      return await AttemptModel.find({ user: userId, isSubmitted: true })
        .populate('quiz', 'title category difficulty timeLimit passingScore')
        .sort({ completedAt: -1 });
    }

    return store.attempts
      .filter(a => a.user.toString() === userId.toString() && a.isSubmitted)
      .map(a => {
        const quiz = store.quizzes.find(q => q._id.toString() === a.quiz.toString());
        return {
          ...a,
          quiz: quiz ? {
            _id: quiz._id,
            title: quiz.title,
            category: quiz.category,
            difficulty: quiz.difficulty,
            timeLimit: quiz.timeLimit,
            passingScore: quiz.passingScore
          } : null
        };
      })
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  },

  async countDocuments(query = {}) {
    if (isDbConnected()) return await AttemptModel.countDocuments(query);
    if (query.isSubmitted) return store.attempts.filter(a => a.isSubmitted).length;
    return store.attempts.length;
  }
};

// --- QUESTION OPERATIONS ---
const QuestionRepo = {
  async findByQuiz(quizId) {
    if (isDbConnected()) {
      return await QuestionModel.find({ quiz: quizId }).sort({ order: 1 });
    }
    return store.questions
      .filter(q => q.quiz.toString() === quizId.toString())
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  async countDocuments() {
    if (isDbConnected()) return await QuestionModel.countDocuments();
    return store.questions.length;
  }
};

module.exports = {
  UserRepo,
  QuizRepo,
  AttemptRepo,
  QuestionRepo,
  isDbConnected
};
