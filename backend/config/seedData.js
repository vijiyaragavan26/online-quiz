const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');

dotenv.config({ path: __dirname + '/../.env' });

const sampleQuizzes = [
  {
    title: 'Modern Full-Stack Web Development',
    description: 'Test your understanding of React, Node.js, REST APIs, asynchronous JavaScript, and state management.',
    category: 'Web Development',
    difficulty: 'Medium',
    timeLimit: 10,
    passingScore: 60,
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

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quizmaster';
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed] Connected to MongoDB.');

    // Create a demo admin and creator
    let demoCreator = await User.findOne({ email: 'demo@quizmaster.com' });
    if (!demoCreator) {
      demoCreator = await User.create({
        name: 'Alex Mercer (QuizMaster Team)',
        email: 'demo@quizmaster.com',
        password: 'password123',
        bio: 'Senior Quizmaster & Educational Content Specialist at QuizMaster.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'admin'
      });
      console.log('[Seed] Created default demo user: demo@quizmaster.com / password123');
    }

    let studentUser = await User.findOne({ email: 'student@quizmaster.com' });
    if (!studentUser) {
      studentUser = await User.create({
        name: 'Sarah Chen',
        email: 'student@quizmaster.com',
        password: 'password123',
        bio: 'Avid learner preparing for tech interviews and certification exams.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: 'user'
      });
      console.log('[Seed] Created default student user: student@quizmaster.com / password123');
    }

    // Seed quizzes if none exist
    const quizCount = await Quiz.countDocuments();
    if (quizCount === 0) {
      console.log('[Seed] Seeding sample quizzes and questions...');

      for (const qData of sampleQuizzes) {
        const { questions, ...quizMeta } = qData;

        const quiz = await Quiz.create({
          ...quizMeta,
          creator: demoCreator._id,
          totalQuestions: questions.length,
          participationCount: Math.floor(Math.random() * 25) + 5,
          averageScore: Math.floor(Math.random() * 25) + 70,
          isPublic: true,
          isPublished: true
        });

        const createdQuestions = await Promise.all(
          questions.map((q, idx) =>
            Question.create({
              quiz: quiz._id,
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              order: idx
            })
          )
        );

        quiz.questions = createdQuestions.map(cq => cq._id);
        await quiz.save();
      }
      console.log('[Seed] Sample quizzes successfully seeded!');
    } else {
      console.log(`[Seed] Database already has ${quizCount} quizzes. Skipping duplicate seeding.`);
    }

    return true;
  } catch (error) {
    console.warn('[Seed] Notice:', error.message);
    return false;
  }
};

if (require.main === module) {
  seedDB().then(() => {
    process.exit(0);
  });
}

module.exports = seedDB;
