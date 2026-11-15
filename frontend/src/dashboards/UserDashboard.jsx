import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService, quizService, attemptService } from '../services/api';
import {
  LayoutDashboard,
  Layers,
  History,
  Settings,
  PlusCircle,
  Award,
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit,
  Eye,
  Globe,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  BarChart2,
  User
} from 'lucide-react';

const UserDashboard = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'created' | 'attempts' | 'profile'
  const [stats, setStats] = useState(null);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [statsRes, quizzesRes, attemptsRes] = await Promise.all([
        dashboardService.getUserStats(),
        dashboardService.getMyQuizzes(),
        attemptService.getMyAttempts()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (quizzesRes.success) setMyQuizzes(quizzesRes.quizzes || []);
      if (attemptsRes.success) setMyAttempts(attemptsRes.attempts || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle Publish / Unpublish Toggle
  const handleTogglePublish = async (quiz) => {
    try {
      await quizService.updateQuiz(quiz._id, {
        isPublished: !quiz.isPublished
      });
      setActionSuccess(`Quiz "${quiz.title}" is now ${!quiz.isPublished ? 'published' : 'unpublished'}.`);
      loadDashboardData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setError('Failed to update quiz visibility.');
    }
  };

  // Handle Delete Quiz
  const handleDeleteQuiz = async (quizId, quizTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${quizTitle}"? All attempt history for this quiz will also be removed.`)) {
      return;
    }

    try {
      await quizService.deleteQuiz(quizId);
      setActionSuccess(`Quiz "${quizTitle}" was deleted successfully.`);
      loadDashboardData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setError('Failed to delete quiz.');
    }
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setError('');
    setActionSuccess('');

    try {
      const payload = { name, bio };
      if (password.trim()) payload.password = password.trim();

      const res = await updateProfile(payload);
      if (res.success) {
        setActionSuccess('Profile updated successfully!');
        setPassword('');
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-700">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* DASHBOARD HEADER */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-purple-600/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{user?.name}</h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase tracking-wide">
                  {user?.role === 'admin' ? 'Educator / Admin' : 'Learner'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              <p className="text-xs text-slate-600 mt-2 max-w-md">{user?.bio}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Link
              to="/create-quiz"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-purple-600/25 transition-transform hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Quiz</span>
            </Link>
          </div>
        </div>

        {/* ALERTS */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TABS NAVIGATION */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview & Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('created')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'created'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Created Quizzes ({myQuizzes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('attempts')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'attempts'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>My Quiz Attempts & Results ({myAttempts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & STATS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Quizzes Created
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{stats?.totalCreated || 0}</div>
                <p className="text-xs text-slate-400 mt-1">Author & manage custom tests</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Attempts
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <History className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{stats?.totalAttempts || 0}</div>
                <p className="text-xs text-slate-400 mt-1">{stats?.passedCount || 0} assessments passed</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Average Score
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{stats?.averageScore || 0}%</div>
                <p className="text-xs text-slate-400 mt-1">Across all completed quizzes</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Best Score
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{stats?.bestScore || 0}%</div>
                <p className="text-xs text-slate-400 mt-1">Highest percentage achieved</p>
              </div>
            </div>

            {/* Creator Impact & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Creator Reach Panel */}
              <div className="lg:col-span-1 bg-gradient-to-br from-navy-900 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-xs uppercase font-extrabold text-purple-400 tracking-wider">
                    Creator Impact
                  </span>
                  <h3 className="text-xl font-bold mt-1 mb-4">Quiz Engagement</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-6">
                    Quizzes you author are visible to thousands of learners. Track total participant attempts and engagement metrics.
                  </p>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <span className="text-xs text-slate-300">Learners Participated:</span>
                      <span className="text-xl font-extrabold text-purple-300">
                        {stats?.totalParticipantsReceived || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10">
                  <Link
                    to="/create-quiz"
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Another Quiz</span>
                  </Link>
                </div>
              </div>

              {/* Recent Quiz Activity */}
              <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900">Recent Quiz Activity</h3>
                  <button
                    onClick={() => setActiveTab('attempts')}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                  >
                    View All Attempts
                  </button>
                </div>

                {stats?.recentActivity?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentActivity.map((act) => (
                      <div
                        key={act._id}
                        className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4 transition-colors"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{act.quizTitle}</h4>
                          <span className="text-xs text-slate-400">
                            {act.category} • {act.difficulty} •{' '}
                            {act.completedAt ? new Date(act.completedAt).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              act.passed
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {act.percentage}% {act.passed ? 'Passed' : 'Failed'}
                          </span>

                          <Link
                            to={`/quiz/results/${act._id}`}
                            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                          >
                            <span>Review</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">You haven't attempted any quizzes yet.</p>
                    <Link
                      to="/explore"
                      className="mt-3 inline-block text-xs font-bold text-purple-600 hover:underline"
                    >
                      Explore Quizzes Now →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY CREATED QUIZZES (QUIZ CREATOR DASHBOARD) */}
        {activeTab === 'created' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Quiz Creator Management</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  View participation metrics, toggle visibility, edit questions, or delete your quizzes.
                </p>
              </div>

              <Link
                to="/create-quiz"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Quiz</span>
              </Link>
            </div>

            {myQuizzes.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {myQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Info */}
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {quiz.category}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            quiz.isPublished
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {quiz.isPublished ? '● Published' : '○ Draft / Private'}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900">{quiz.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{quiz.description}</p>

                      <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1">
                        <span>{quiz.totalQuestions || quiz.questions?.length || 0} Questions</span>
                        <span>•</span>
                        <span>{quiz.timeLimit} mins limit</span>
                        <span>•</span>
                        <span>Pass: {quiz.passingScore || 60}%</span>
                      </div>
                    </div>

                    {/* Middle: Participation & Analytics */}
                    <div className="flex items-center space-x-6 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 shrink-0">
                      <div>
                        <div className="flex items-center space-x-1 font-bold text-slate-900 text-base">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span>{quiz.participationCount || 0}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">Learners</span>
                      </div>

                      <div className="h-8 w-px bg-slate-200" />

                      <div>
                        <div className="flex items-center space-x-1 font-bold text-slate-900 text-base">
                          <BarChart2 className="w-4 h-4 text-emerald-600" />
                          <span>{quiz.averageScore || 0}%</span>
                        </div>
                        <span className="text-[11px] text-slate-400">Avg. Score</span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleTogglePublish(quiz)}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1 transition-colors ${
                          quiz.isPublished
                            ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={quiz.isPublished ? 'Unpublish quiz' : 'Publish quiz'}
                      >
                        {quiz.isPublished ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                        <span>{quiz.isPublished ? 'Unpublish' : 'Publish'}</span>
                      </button>

                      <Link
                        to={`/edit-quiz/${quiz._id}`}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                        title="Edit quiz"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDeleteQuiz(quiz._id, quiz.title)}
                        className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        title="Delete quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800 mb-1">No quizzes authored yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Create your first interactive quiz with multiple choice questions, timer, and explanations.
                </p>
                <Link
                  to="/create-quiz"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors inline-flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Your First Quiz</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY QUIZ ATTEMPTS & RESULTS */}
        {activeTab === 'attempts' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">My Quiz Attempts & Performance</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review your scores, pass/fail status, and examine detailed question keys.
              </p>
            </div>

            {myAttempts.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {myAttempts.map((attempt) => (
                  <div
                    key={attempt._id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {attempt.quiz?.category || 'General'}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            attempt.passed
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {attempt.passed ? '✓ Passed' : '✗ Failed'}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        {attempt.quiz?.title || 'Assessment'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Completed on {new Date(attempt.completedAt || attempt.createdAt).toLocaleDateString()} •{' '}
                        {attempt.timeTakenSeconds ? `${Math.floor(attempt.timeTakenSeconds / 60)}m ${attempt.timeTakenSeconds % 60}s taken` : 'Completed'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-6 shrink-0">
                      <div className="text-right">
                        <div className="text-xl font-black text-slate-900">{attempt.percentage}%</div>
                        <span className="text-[11px] text-slate-400">
                          {attempt.score} of {attempt.totalQuestions} Correct
                        </span>
                      </div>

                      <Link
                        to={`/quiz/results/${attempt._id}`}
                        className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Key & Review</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800 mb-1">No completed attempts</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Take a test to practice and track your knowledge across various disciplines.
                </p>
                <Link
                  to="/explore"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors inline-flex items-center space-x-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Explore Quizzes</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm max-w-xl mx-auto space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Profile Settings</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your display name, bio, and account password.
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Bio / Educator Summary
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Change Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  placeholder="New password (optional)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-colors disabled:opacity-60"
              >
                {profileSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
