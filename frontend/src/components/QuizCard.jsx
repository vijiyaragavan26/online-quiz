import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, HelpCircle, Users, ArrowRight, Award } from 'lucide-react';

const difficultyColors = {
  Easy: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Hard: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
};

const categoryGradients = {
  'Web Development': 'from-blue-600 to-indigo-600',
  'Programming': 'from-purple-600 to-pink-600',
  'Science': 'from-emerald-600 to-teal-600',
  'History': 'from-amber-600 to-orange-600',
  'Mathematics': 'from-cyan-600 to-blue-600',
  'General Knowledge': 'from-violet-600 to-purple-600'
};

const QuizCard = ({ quiz }) => {
  const diffClass = difficultyColors[quiz.difficulty] || difficultyColors.Medium;
  const gradient = categoryGradients[quiz.category] || 'from-purple-600 to-indigo-600';

  const creatorName = quiz.creator?.name || 'QuizMaster';
  const creatorInitial = creatorName.charAt(0).toUpperCase();

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-purple-300 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Top Accent Gradient Bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Tags */}
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 tracking-wide">
              {quiz.category}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${diffClass}`}>
              {quiz.difficulty}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-1 mb-2">
            {quiz.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {quiz.description}
          </p>
        </div>

        <div>
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 py-3 px-3.5 bg-slate-50/80 rounded-xl border border-slate-100 mb-4 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-500" />
              <span>{quiz.timeLimit} mins limit</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>{quiz.totalQuestions || quiz.questions?.length || 0} Questions</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              <span>Pass: {quiz.passingScore || 60}%</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{quiz.participationCount || 0} attempts</span>
            </div>
          </div>

          {/* Creator & CTA */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 pr-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {creatorInitial}
              </div>
              <span className="text-xs text-slate-500 truncate font-medium">
                {creatorName}
              </span>
            </div>

            <Link
              to={`/quiz/${quiz._id}`}
              className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-sm shadow-purple-600/20 transition-all hover:scale-[1.03] shrink-0"
            >
              <span>Start Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
