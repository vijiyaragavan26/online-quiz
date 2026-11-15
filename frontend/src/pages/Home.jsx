import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizService, dashboardService } from '../services/api';
import QuizCard from '../components/QuizCard';
import {
  Sparkles,
  ArrowRight,
  PlusCircle,
  BookOpen,
  Award,
  Users,
  Timer,
  CheckCircle2,
  Brain,
  Zap,
  TrendingUp,
  Flame,
  Globe,
  Code2,
  Atom,
  Hourglass
} from 'lucide-react';

const categoryIcons = {
  'Web Development': Code2,
  'Programming': Brain,
  'Science': Atom,
  'History': Hourglass,
  'General Knowledge': Globe,
  'Mathematics': Zap
};

const Home = () => {
  const [featuredQuizzes, setFeaturedQuizzes] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 145,
    totalQuizzes: 28,
    totalAttempts: 1250,
    totalQuestions: 240,
    popularCategories: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, statsRes] = await Promise.all([
          quizService.getQuizzes({ limit: 6, sort: 'popular' }),
          dashboardService.getPlatformStats()
        ]);

        if (quizRes.success) {
          setFeaturedQuizzes(quizRes.quizzes.slice(0, 3));
          setRecentQuizzes(quizRes.quizzes.slice(3, 6));
        }

        if (statsRes.success && statsRes.stats) {
          setStats(statsRes.stats);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-navy-900 text-white py-20 lg:py-28 border-b border-slate-800">
        {/* Ambient Gradient Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-6 shadow-inner animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Interactive Assessment & Quiz Maker Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight lg:leading-[1.15] mb-6">
            Challenge Your Knowledge.{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
              Learn Something New.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
            Create interactive quizzes, test your knowledge, challenge peers, and discover how much you really know with instant analytics.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              to="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] text-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Quizzes</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/create-quiz"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-purple-500/50 transition-all hover:scale-[1.02] text-sm"
            >
              <PlusCircle className="w-4 h-4 text-purple-400" />
              <span>Create Your Quiz</span>
            </Link>
          </div>

          {/* Hero Feature Pills */}
          <div className="mt-14 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Countdown Timers</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Tamper-Proof Server Grading</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>In-Depth Answer Explanations</span>
            </span>
          </div>
        </div>
      </section>

      {/* PLATFORM STATISTICS BANNER */}
      <section className="bg-white border-b border-slate-200/80 py-10 shadow-sm relative z-10 -mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="pt-3 md:pt-0">
              <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {stats.totalUsers}+
              </div>
              <p className="text-xs uppercase tracking-wider font-semibold text-purple-600 mt-1">
                Active Learners
              </p>
            </div>
            <div className="pt-3 md:pt-0">
              <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {stats.totalQuizzes}+
              </div>
              <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600 mt-1">
                Curated Quizzes
              </p>
            </div>
            <div className="pt-3 md:pt-0">
              <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {stats.totalAttempts}+
              </div>
              <p className="text-xs uppercase tracking-wider font-semibold text-emerald-600 mt-1">
                Quiz Attempts
              </p>
            </div>
            <div className="pt-3 md:pt-0">
              <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {stats.totalQuestions}+
              </div>
              <p className="text-xs uppercase tracking-wider font-semibold text-pink-600 mt-1">
                Total Questions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Discover Disciplines
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Explore Popular Categories
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-sm font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center space-x-1 mt-2 sm:mt-0"
          >
            <span>View All Quizzes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Web Development', desc: 'React, Node & APIs', color: 'from-blue-500 to-indigo-600' },
            { name: 'Programming', desc: 'ES6+, Logic, Algos', color: 'from-purple-500 to-pink-600' },
            { name: 'Science', desc: 'Space, Biology, Physics', color: 'from-emerald-500 to-teal-600' },
            { name: 'History', desc: 'Ancient Civilizations', color: 'from-amber-500 to-orange-600' },
            { name: 'Mathematics', desc: 'Algebra & Statistics', color: 'from-cyan-500 to-blue-600' },
            { name: 'General Knowledge', desc: 'Trivia & Facts', color: 'from-violet-500 to-purple-600' }
          ].map((cat, idx) => {
            const Icon = categoryIcons[cat.name] || Globe;
            return (
              <Link
                key={idx}
                to={`/explore?category=${encodeURIComponent(cat.name)}`}
                className="group p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-purple-300 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">{cat.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED QUIZZES */}
      <section className="py-16 bg-slate-100/60 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-600">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Top Ranked</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Featured Quizzes
              </h2>
            </div>
            <Link
              to="/explore"
              className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center space-x-1"
            >
              <span>Browse All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-64 bg-white rounded-2xl animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : featuredQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredQuizzes.map(quiz => (
                <QuizCard key={quiz._id} quiz={quiz} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-10">No quizzes available yet.</p>
          )}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Simple & Transparent
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1 mb-4">
            How QuizMaster Works
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Everything you need to test understanding, learn new topics, or publish your own classroom assessments in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold text-lg mb-6">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Select or Build a Quiz
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Explore hundreds of verified quizzes across tech, programming, and general knowledge, or build your own with custom time limits and passing criteria.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-lg mb-6">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Take the Timed Challenge
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Interact with a clean, distraction-free interface. Track real-time progress, navigate questions seamlessly, and submit before the countdown timer expires.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-lg mb-6">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Instant Analysis & Review
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Get server-verified scores instantly. Review every question, analyze correct answers vs chosen options, and read detailed explanations.
            </p>
          </div>
        </div>
      </section>

      {/* RECENTLY CREATED QUIZZES */}
      {recentQuizzes.length > 0 && (
        <section className="py-16 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Fresh Drops
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Recently Created Quizzes
                </h2>
              </div>
              <Link
                to="/explore?sort=newest"
                className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center space-x-1"
              >
                <span>View More</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentQuizzes.map(quiz => (
                <QuizCard key={quiz._id} quiz={quiz} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BOTTOM CTA BANNER */}
      <section className="py-16 bg-navy-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to Test What You Know?
          </h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Join QuizMaster today. Create custom quizzes for your students or take existing challenges to sharpen your skills.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/explore"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 transition-all text-sm"
            >
              Get Started Now
            </Link>
            <Link
              to="/create-quiz"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm transition-all"
            >
              Create a Quiz
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
