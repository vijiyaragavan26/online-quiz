const bcrypt = require('bcryptjs');

class MemoryStore {
  constructor() {
    this.users = [];
    this.quizzes = [];
    this.questions = [];
    this.attempts = [];
    this.idCounter = 1000;
    this.initDefaultData();
  }

  generateId() {
    this.idCounter++;
    return 'id_' + this.idCounter + '_' + Math.random().toString(36).substr(2, 9);
  }

  async initDefaultData() {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Default admin creator
    const adminId = this.generateId();
    this.users.push({
      _id: adminId,
      name: 'Alex Mercer (QuizMaster Team)',
      email: 'demo@quizmaster.com',
      password: hashedPassword,
      bio: 'Senior Quizmaster & Educational Content Specialist at QuizMaster.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      createdAt: new Date('2026-01-10T10:00:00Z'),
      async matchPassword(entered) {
        return await bcrypt.compare(entered, this.password);
      }
    });

    // Default student user
    const studentId = this.generateId();
    this.users.push({
      _id: studentId,
      name: 'Sarah Chen',
      email: 'student@quizmaster.com',
      password: hashedPassword,
      bio: 'Avid learner preparing for tech interviews and certification exams.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'user',
      createdAt: new Date('2026-01-15T12:00:00Z'),
      async matchPassword(entered) {
        return await bcrypt.compare(entered, this.password);
      }
    });

    // Sample Quizzes
    const rawQuizzes = [
      {
        title: 'Modern Full-Stack Web Development',
        description: 'Test your understanding of React, Node.js, REST APIs, asynchronous JavaScript, and state management.',
        category: 'Web Development',
        difficulty: 'Medium',
        timeLimit: 10,
        passingScore: 60,
        participationCount: 42,
        averageScore: 78,
        questions: [
          {
            questionText: 'What is the primary purpose of React useEffect hook?',
            options: [
              'To mutate state directly inside render',
              'To manage side effects such as data fetching, subscriptions, and DOM mutations',
              'To define custom CSS animations',
              'To create a global Redux store'
            ],
            correctAnswer: 1,
            explanation: 'useEffect lets you perform side effects in functional components like data fetching and timers after the DOM updates.'
          },
          {
            questionText: 'Which HTTP status code signifies "201 Created"?',
            options: [
              'The request was accepted but not completed',
              'The request succeeded and a new resource was successfully created',
              'The server redirected the client',
              'The request lacked valid authentication credentials'
            ],
            correctAnswer: 1,
            explanation: 'HTTP 201 Created indicates that the request succeeded and resulted in the creation of a new resource.'
          },
          {
            questionText: 'In Node.js Express, what does the next() function do inside middleware?',
            options: [
              'Passes execution control to the next middleware or route handler in the stack',
              'Terminates the current HTTP request immediately',
              'Restarts the Express application server',
              'Sends a 200 OK JSON response back to the client'
            ],
            correctAnswer: 0,
            explanation: 'Calling next() passes control to the next middleware in line. If omitted without sending a response, the request hangs.'
          },
          {
            questionText: 'What is the difference between SQL and NoSQL databases like MongoDB?',
            options: [
              'MongoDB does not support document storage',
              'MongoDB stores JSON-like BSON documents with dynamic flexible schemas, whereas relational databases use tabular relations with fixed schemas',
              'SQL databases can only run in the browser',
              'NoSQL databases cannot be indexed or searched'
            ],
            correctAnswer: 1,
            explanation: 'MongoDB is a document-oriented database using BSON (binary JSON) allowing flexible schemas, unlike strict relational SQL tables.'
          },
          {
            questionText: 'What is the purpose of JSON Web Tokens (JWT) in modern web applications?',
            options: [
              'To encrypt entire database collections',
              'To securely transmit claims between parties as a compact, self-contained, digitally signed token for stateless authentication',
              'To compress static frontend assets and images',
              'To replace HTTPS encryption completely'
            ],
            correctAnswer: 1,
            explanation: 'JWT allows stateless authentication where the client stores a cryptographically signed token proving user identity.'
          }
        ]
      },
      {
        title: 'JavaScript Mastery & ES6+ Essentials',
        description: 'Deep dive into closures, promises, event loop, destructuring, and advanced JS mechanisms.',
        category: 'Programming',
        difficulty: 'Hard',
        timeLimit: 8,
        passingScore: 70,
        participationCount: 35,
        averageScore: 72,
        questions: [
          {
            questionText: 'What is the output of typeof null in JavaScript?',
            options: ['null', 'undefined', 'object', 'boolean'],
            correctAnswer: 2,
            explanation: 'In JavaScript, typeof null returns "object" due to a historical legacy bug in the original JS engine implementation.'
          },
          {
            questionText: 'Which event loop phase executes resolved Promise callbacks (.then, async/await)?',
            options: [
              'Macro-task / Timer queue (setTimeout)',
              'Microtask queue',
              'Check phase (setImmediate)',
              'Poll phase'
            ],
            correctAnswer: 1,
            explanation: 'Promises and queueMicrotask callbacks are queued in the microtask queue, which drains right after the current execution frame.'
          },
          {
            questionText: 'What happens when using "use strict" regarding undeclared variables?',
            options: [
              'It automatically converts them to global variables',
              'It throws a ReferenceError instead of silently creating global properties',
              'It deletes the variables from memory',
              'It converts them into null values'
            ],
            correctAnswer: 1,
            explanation: 'Strict mode prevents accidental globals by throwing a ReferenceError when assigning to an undeclared variable.'
          },
          {
            questionText: 'Which array method returns a single accumulated value without mutating the original array?',
            options: ['reduce()', 'splice()', 'push()', 'sort()'],
            correctAnswer: 0,
            explanation: 'Array.prototype.reduce() executes a reducer callback on each element, returning a single accumulated result.'
          }
        ]
      },
      {
        title: 'General Science & Astronomy Trivia',
        description: 'Explore fascinating facts about the cosmos, physics, biology, and scientific discoveries.',
        category: 'Science',
        difficulty: 'Easy',
        timeLimit: 5,
        passingScore: 50,
        participationCount: 68,
        averageScore: 84,
        questions: [
          {
            questionText: 'Which planet in our solar system is known as the "Red Planet"?',
            options: ['Venus', 'Mars', 'Jupiter', 'Mercury'],
            correctAnswer: 1,
            explanation: 'Mars is called the Red Planet because iron minerals in its soil oxidize (rust), giving it a reddish appearance.'
          },
          {
            questionText: 'What is the fundamental unit of life in all living organisms?',
            options: ['Atom', 'Tissue', 'Cell', 'Organ'],
            correctAnswer: 2,
            explanation: 'The biological cell is the smallest structural and functional unit of life.'
          },
          {
            questionText: 'What gas do plants primarily absorb from the atmosphere for photosynthesis?',
            options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Helium'],
            correctAnswer: 1,
            explanation: 'Plants absorb carbon dioxide (CO2) and release oxygen as a byproduct during photosynthesis.'
          },
          {
            questionText: 'What is the speed of light in vacuum approximately?',
            options: ['300,000 km/s', '150,000 km/s', '1,000 km/s', '30,000 km/s'],
            correctAnswer: 0,
            explanation: 'Light travels at approximately 299,792 kilometers per second in a vacuum (roughly 300,000 km/s).'
          }
        ]
      },
      {
        title: 'World History & Civilizations',
        description: 'Test your knowledge on ancient empires, world wonders, and pivotal turning points in human history.',
        category: 'History',
        difficulty: 'Medium',
        timeLimit: 7,
        passingScore: 60,
        participationCount: 29,
        averageScore: 68,
        questions: [
          {
            questionText: 'Which ancient civilization built the monumental Machu Picchu complex in Peru?',
            options: ['The Aztecs', 'The Mayans', 'The Incas', 'The Romans'],
            correctAnswer: 2,
            explanation: 'Machu Picchu was built by the Inca Empire in the 15th century high in the Andes mountains.'
          },
          {
            questionText: 'In which year did the Apollo 11 mission successfully land the first humans on the Moon?',
            options: ['1965', '1969', '1972', '1959'],
            correctAnswer: 1,
            explanation: 'American astronauts Neil Armstrong and Buzz Aldrin landed on the Moon on July 20, 1969.'
          },
          {
            questionText: 'Who painted the famous Renaissance masterpiece "Mona Lisa"?',
            options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Vincent van Gogh'],
            correctAnswer: 1,
            explanation: 'The Mona Lisa was painted by the Italian Renaissance polymath Leonardo da Vinci in the early 16th century.'
          }
        ]
      }
    ];

    for (const qData of rawQuizzes) {
      const quizId = this.generateId();
      const questionIds = [];

      qData.questions.forEach((q, idx) => {
        const questionId = this.generateId();
        questionIds.push(questionId);
        this.questions.push({
          _id: questionId,
          quiz: quizId,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          order: idx,
          createdAt: new Date()
        });
      });

      this.quizzes.push({
        _id: quizId,
        title: qData.title,
        description: qData.description,
        category: qData.category,
        difficulty: qData.difficulty,
        timeLimit: qData.timeLimit,
        passingScore: qData.passingScore,
        participationCount: qData.participationCount,
        averageScore: qData.averageScore,
        isPublic: true,
        isPublished: true,
        creator: adminId,
        questions: questionIds,
        totalQuestions: questionIds.length,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10 * 86400000))
      });
    }

    // Seed 1 sample completed attempt for demo student
    const sampleQuiz = this.quizzes[0];
    const attemptId = this.generateId();
    this.attempts.push({
      _id: attemptId,
      user: studentId,
      quiz: sampleQuiz._id,
      answers: [
        { question: sampleQuiz.questions[0], selectedOption: 1, isCorrect: true },
        { question: sampleQuiz.questions[1], selectedOption: 1, isCorrect: true },
        { question: sampleQuiz.questions[2], selectedOption: 0, isCorrect: true },
        { question: sampleQuiz.questions[3], selectedOption: 1, isCorrect: true },
        { question: sampleQuiz.questions[4], selectedOption: 0, isCorrect: false }
      ],
      totalQuestions: 5,
      correctAnswers: 4,
      incorrectAnswers: 1,
      unansweredCount: 0,
      score: 4,
      percentage: 80,
      passed: true,
      timeTakenSeconds: 240,
      isSubmitted: true,
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3360000)
    });
  }
}

const memoryStore = new MemoryStore();
module.exports = memoryStore;
