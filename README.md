# QuizMaster – Online Quiz Maker & Assessment Platform

> **CodSoft Web Development Internship – Level 2 Task 2**  
> A modern, responsive, and full-featured online quiz platform built with **React.js**, **Node.js**, **Express.js**, and **MongoDB**.

---

## 🌟 Overview

**QuizMaster** is a premium educational technology platform designed for learners, educators, and institutions. It enables users to create customizable multiple-choice quizzes, set time limits and passing criteria, attempt timed assessments with real-time countdown clocks, and receive instant server-side graded evaluations with detailed question-by-question reviews.

---

## 🎨 Design & UI/UX

- **Color Palette**: Dark Navy (`#0B1120`, `#070b14`), Deep Purple (`#7C3AED`), Indigo (`#6366F1`), Emerald Green for success, Rose for errors, and Crisp White.
- **Glassmorphic & Gradient Accents**: Clean backdrop blurs, subtle neon glow, and modern elevation.
- **Typography**: Inter & Plus Jakarta Sans for clean readability.
- **Micro-Interactions**: Smooth state transitions, touch-friendly option selection, and confetti celebration on passing.
- **Fully Responsive**: Optimized for mobile screens, tablets, and desktop displays.

---

## 🚀 Key Features

### 1. User Authentication & Profile
- Secure registration and login using **JSON Web Tokens (JWT)**.
- Passwords cryptographically hashed using **bcryptjs** (10 salt rounds).
- Protected API routes and authenticated sessions.
- Profile management with custom bio, display name, and password update.
- **Instant Demo Logins**: One-click quick-fill buttons for **Demo Creator** and **Demo Student**.

### 2. Quiz Exploration & Discovery
- Search bar with instant keyword matching across titles, descriptions, and categories.
- Category filtering (Web Development, Programming, Science, History, Mathematics, General Knowledge).
- Difficulty filtering (Easy, Medium, Hard).
- Flexible sorting (Newest, Most Popular, Shortest Time, Longest Time, Alphabetical).
- Clean pagination controls and active results counter.

### 3. Interactive Quiz Taking Engine
- Distraction-free test environment displaying **one question at a time**.
- Four touch-friendly option cards with distinct active/selected states.
- **Countdown Timer**: Automatically counts down in minutes and seconds, turns red under 2 minutes, and pulses under 30 seconds.
- **Automatic Submission**: Instantly and safely auto-submits answers when the timer reaches 00:00.
- **Question Navigation Palette**: Quick-jump drawer indicating current, answered, and unanswered questions.
- **Confirmation Modal**: Warns the student before submitting and highlights unanswered questions.
- **Anti-Cheat Protection**: Correct answers and explanations are **never leaked** to the client before submission.

### 4. Server-Side Grading & Results Analysis
- All scores, percentages, and pass/fail statuses are computed on the server.
- **Passing Score Logic**: Dynamic pass/fail evaluation tailored to each quiz's configured threshold.
- Interactive **Review Answers Key**:
  - Highlights correct answers in green.
  - Highlights student mistakes in red.
  - Displays comprehensive explanations to foster understanding.
- Retake quiz and explore more assessments.

### 5. Creator & User Dashboards
- **User Dashboard**:
  - Overview statistics: Total quizzes created, total attempts, average score, and best score.
  - Recent assessment activity feed with direct links to review answers.
- **Quiz Creator Dashboard**:
  - Manage authored quizzes with live participant counts and average learner scores.
  - Toggle quiz visibility (Published vs. Draft/Private).
  - Edit quiz questions, time limits, and descriptions.
  - Permanently delete quizzes and clean up associated attempts.
- **Live Preview Modal**: Preview tests exactly as students will experience them before publishing.

---

## 📁 Project Directory Structure

```text
online quiz/
│
├── frontend/                     # React Single Page Application (Vite)
│   ├── public/                   # Static assets & icons
│   ├── src/
│   │   ├── components/           # Navbar, Footer, QuizCard, ProtectedRoute
│   │   ├── pages/                # Home, ExploreQuizzes, Login, Register, NotFound
│   │   ├── dashboards/           # UserDashboard (with Creator Management & Profile)
│   │   ├── quiz/                 # CreateQuiz, TakeQuiz, QuizResult
│   │   ├── services/             # Axios API client (api.js)
│   │   ├── context/              # AuthContext.jsx (JWT state & persistence)
│   │   ├── App.jsx               # Application routes & layout
│   │   ├── main.jsx              # React DOM entry point
│   │   └── index.css             # Tailwind base & custom utility classes
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                      # Node.js Express REST API
│   ├── config/
│   │   ├── db.js                 # MongoDB connection handler
│   │   ├── dataService.js        # Data service layer (Dual-Mode: MongoDB + zero-config memory store)
│   │   ├── store.js              # Resilient fallback memory store & seed data
│   │   └── seedData.js           # Sample quizzes & accounts seeder
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Profile endpoints
│   │   ├── quizController.js     # Quiz CRUD, filters, pagination
│   │   ├── attemptController.js  # Quiz sessions, server grading, results
│   │   └── dashboardController.js# User stats & platform metrics
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification middleware
│   │   └── errorHandler.js       # Central error & validation handler
│   ├── models/
│   │   ├── User.js               # User Mongoose schema & bcrypt hooks
│   │   ├── Quiz.js               # Quiz Mongoose schema
│   │   ├── Question.js           # Question Mongoose schema
│   │   └── QuizAttempt.js        # QuizAttempt Mongoose schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── quizRoutes.js         # /api/quizzes
│   │   ├── attemptRoutes.js      # /api/attempts
│   │   └── dashboardRoutes.js    # /api/dashboard
│   ├── .env                      # Environment variables
│   ├── .env.example              # Sample environment template
│   ├── server.js                 # Express server bootstrap
│   └── package.json
│
├── package.json                  # Root runner scripts
└── README.md                     # Comprehensive documentation
```

---

## 🗄️ Database Design (MongoDB)

### 1. `Users`
- `name`: String (Required)
- `email`: String (Required, Unique, Lowercase)
- `password`: String (Required, Hashed with bcrypt)
- `bio`: String (User description/credentials)
- `avatar`: String (Profile image URL)
- `role`: String (`user` or `admin`)
- `createdAt`, `updatedAt`: Timestamps

### 2. `Quizzes`
- `title`: String (Required)
- `description`: String (Required)
- `category`: String (e.g. Web Development, Programming, Science, History)
- `difficulty`: String (`Easy`, `Medium`, `Hard`)
- `timeLimit`: Number (Minutes, default: 10)
- `passingScore`: Number (Percentage, default: 60%)
- `isPublic`: Boolean
- `isPublished`: Boolean
- `creator`: ObjectId (Ref -> User)
- `questions`: [ObjectId] (Ref -> Question)
- `participationCount`: Number
- `averageScore`: Number
- `createdAt`, `updatedAt`: Timestamps

### 3. `Questions`
- `quiz`: ObjectId (Ref -> Quiz)
- `questionText`: String (Required)
- `options`: [String] (Exactly 4 non-empty strings)
- `correctAnswer`: Number (Index 0 to 3)
- `explanation`: String (Optional educational breakdown)
- `order`: Number

### 4. `QuizAttempts`
- `user`: ObjectId (Ref -> User)
- `quiz`: ObjectId (Ref -> Quiz)
- `answers`: Array of `{ question, selectedOption, isCorrect }`
- `totalQuestions`: Number
- `correctAnswers`: Number
- `incorrectAnswers`: Number
- `unansweredCount`: Number
- `score`: Number
- `percentage`: Number
- `passed`: Boolean
- `timeTakenSeconds`: Number
- `isSubmitted`: Boolean
- `startedAt`, `completedAt`: Timestamps

---

## 🔌 Backend REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | Public |
| `GET` | `/api/auth/profile` | Get logged-in user profile | Private |
| `PUT` | `/api/auth/profile` | Update profile details / password | Private |

### Quizzes (`/api/quizzes`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/quizzes` | List published quizzes with search, category, sort & pagination | Public |
| `POST` | `/api/quizzes` | Create a new quiz with questions | Private |
| `GET` | `/api/quizzes/:id` | Get quiz details (sanitizes answers for quiz takers) | Public/Private |
| `PUT` | `/api/quizzes/:id` | Update quiz and questions | Private (Owner/Admin) |
| `DELETE` | `/api/quizzes/:id` | Delete quiz, questions, and attempts | Private (Owner/Admin) |

### Quiz Attempts & Grading (`/api/attempts`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/attempts/start` | Start timed attempt session & fetch questions | Private |
| `POST` | `/api/attempts/:id/submit` | Submit answers, calculate score server-side | Private |
| `GET` | `/api/attempts/my-attempts` | List user's completed attempt history | Private |
| `GET` | `/api/attempts/:id/results` | Get detailed result with question review & explanations | Private (Owner/Creator) |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | User metrics: total created, attempts, avg score | Private |
| `GET` | `/api/dashboard/my-quizzes` | Quizzes authored by current user with engagement stats | Private |
| `GET` | `/api/dashboard/platform-stats` | Global stats for Homepage hero | Public |

---

## 💻 Installation & Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- Optional: [MongoDB](https://www.mongodb.com/) (Local or MongoDB Atlas free cloud cluster).  
  *Note: If no MongoDB server is running, QuizMaster automatically initializes a resilient in-memory fallback layer pre-seeded with sample quizzes, users, and questions so you can test immediately with zero friction!*

### Step 1: Clone or Navigate to Directory
```bash
cd "c:\Users\vijiy\OneDrive\Desktop\online quiz"
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Run the Application
You can run both frontend and backend concurrently or in separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm start
# Live at: http://localhost:5001
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Live at: http://localhost:5173
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## 🔑 Demo Accounts for Quick Evaluation

You can use the 1-click **"Instant Demo Login"** buttons on the Login page (`/login`), or manually sign in with:

| Account Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Demo Creator** | `demo@quizmaster.com` | `password123` | Create, edit, delete, publish quizzes; view participation metrics |
| **Demo Student** | `student@quizmaster.com` | `password123` | Take quizzes, view results, track attempt history |

Or register your own custom account directly from the **Register** page!

---

## 🛡️ Security Best Practices Implemented

1. **Server-Side Grading**: Score calculation, percentages, and pass/fail statuses are strictly verified on the server. The frontend never computes or dictates scores.
2. **Answer Concealment**: Correct answers and question explanations are stripped from API payloads when questions are served to quiz takers. They are only disclosed after final submission.
3. **Duplicate Submission Guard**: An attempt session cannot be submitted more than once.
4. **Ownership & Access Control**: Only authorized creators or administrators can edit or delete their respective quizzes.
5. **Sanitized Input & Error Handling**: Comprehensive validation checks prevent empty options, malformed arrays, or invalid IDs.

---

## 🎓 CodSoft Internship Details

- **Internship**: CodSoft Web Development Internship
- **Level**: Level 2
- **Task**: Task 2 – Online Quiz Maker Platform
- **Project**: QuizMaster Platform

Developed with dedication to modern web standards, security, accessibility, and exceptional user experience.
