import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { attemptService } from '../services/api';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Award,
  RotateCcw,
  LayoutDashboard,
  Check,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  BookOpen
} from 'lucide-react';

const QuizResult = () => {
  const { id: attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await attemptService.getResults(attemptId);
        if (res.success && res.result) {
          setResult(res.result);

          // Confetti explosion if passed!
          if (res.result.passed) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        } else {
          setError(res.message || 'Could not retrieve quiz result.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attempt result.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-700">Analyzing your assessment performance...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-rose-200 text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Error Loading Result</h3>
          <p className="text-xs text-slate-500 mb-6">{error || 'Result details are unavailable.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Format time taken
  const timeTaken = result.timeTakenSeconds || 0;
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;
  const timeDisplay = `${mins}m ${secs}s`;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* SUMMARY HERO CARD */}
        <div
          className={`rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden text-center ${
            result.passed
              ? 'bg-gradient-to-tr from-emerald-950 via-navy-900 to-purple-950 border border-emerald-500/30'
              : 'bg-gradient-to-tr from-rose-950 via-navy-900 to-slate-950 border border-rose-500/30'
          }`}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Pass/Fail Badge */}
          <div
            className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 ${
              result.passed
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
          >
            {result.passed ? <Sparkles className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{result.passed ? 'Assessment Passed' : 'Assessment Not Passed'}</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            {result.passed ? 'Outstanding Performance!' : 'Good Effort! Keep Practicing.'}
          </h1>
          <p className="text-sm text-slate-300 max-w-lg mx-auto mb-8">
            You completed <span className="font-semibold text-white">"{result.quizTitle}"</span> with a score of{' '}
            <span className="font-bold text-white">{result.percentage}%</span> (Passing score:{' '}
            {result.passingScore}%).
          </p>

          {/* Score Circle / Hero Metric */}
          <div className="flex items-center justify-center gap-6 sm:gap-12 py-6 border-y border-white/10 max-w-xl mx-auto">
            <div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                {result.score} / {result.totalQuestions}
              </div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">
                Final Score
              </p>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-purple-400">
                {result.percentage}%
              </div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">
                Percentage
              </p>
            </div>
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-8 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-center space-x-1.5 text-emerald-400 font-bold text-lg">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{result.correctAnswers}</span>
              </div>
              <span className="text-slate-400">Correct Answers</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-center space-x-1.5 text-rose-400 font-bold text-lg">
                <X className="w-4 h-4 stroke-[3]" />
                <span>{result.incorrectAnswers}</span>
              </div>
              <span className="text-slate-400">Incorrect Answers</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-center space-x-1.5 text-amber-400 font-bold text-lg">
                <HelpCircle className="w-4 h-4" />
                <span>{result.unansweredCount}</span>
              </div>
              <span className="text-slate-400">Unanswered</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-center space-x-1.5 text-indigo-400 font-bold text-lg">
                <Clock className="w-4 h-4" />
                <span>{timeDisplay}</span>
              </div>
              <span className="text-slate-400">Time Taken</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            <button
              onClick={() => navigate(`/quiz/${result.quizId}`)}
              className="px-6 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center space-x-2 shadow-lg transition-transform hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center space-x-2 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>

            <button
              onClick={() => navigate('/explore')}
              className="px-6 py-2.5 rounded-xl bg-purple-600/50 hover:bg-purple-600/80 border border-purple-500/40 text-purple-200 font-semibold text-xs flex items-center space-x-2 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore More Quizzes</span>
            </button>
          </div>
        </div>

        {/* DETAILED QUESTION REVIEW SECTION */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs uppercase font-extrabold text-purple-600 tracking-wider">
                Answer Key & Analysis
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Detailed Question Review
              </h2>
            </div>

            <button
              onClick={() => setShowReview(!showReview)}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center space-x-1"
            >
              <span>{showReview ? 'Hide Review' : 'Show Review'}</span>
              {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showReview && (
            <div className="space-y-6">
              {result.review?.map((q, idx) => {
                const isCorrect = q.isCorrect;
                const isSkipped = q.selectedOption === null || q.selectedOption === undefined;

                return (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl border transition-all ${
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : isSkipped
                        ? 'border-amber-200 bg-amber-50/20'
                        : 'border-rose-200 bg-rose-50/20'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-center justify-between text-xs font-semibold mb-3">
                      <span className="text-slate-500 uppercase tracking-wider">
                        Question {idx + 1}
                      </span>
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-700'
                            : isSkipped
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Correct</span>
                          </>
                        ) : isSkipped ? (
                          <>
                            <HelpCircle className="w-3 h-3" />
                            <span>Unanswered</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 stroke-[3]" />
                            <span>Incorrect</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Question Text */}
                    <h3 className="text-base font-bold text-slate-900 mb-4">
                      {q.questionText}
                    </h3>

                    {/* Options Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                      {q.options.map((optText, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isThisCorrect = q.correctAnswer === optIdx;
                        const isThisSelected = q.selectedOption === optIdx;

                        let optClasses = 'border-slate-200 bg-white text-slate-700';
                        if (isThisCorrect) {
                          optClasses = 'border-emerald-400 bg-emerald-100/70 text-emerald-950 font-semibold ring-1 ring-emerald-300';
                        } else if (isThisSelected && !isThisCorrect) {
                          optClasses = 'border-rose-300 bg-rose-100/70 text-rose-950 font-medium';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${optClasses}`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <span className="w-6 h-6 rounded-lg bg-white/80 border border-slate-200/80 flex items-center justify-center font-bold text-[11px]">
                                {letter}
                              </span>
                              <span>{optText}</span>
                            </div>

                            {isThisCorrect && (
                              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded ml-2 shrink-0">
                                Correct Answer
                              </span>
                            )}
                            {isThisSelected && !isThisCorrect && (
                              <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-200/60 px-2 py-0.5 rounded ml-2 shrink-0">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    {q.explanation && (
                      <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 space-y-1">
                        <span className="font-bold flex items-center space-x-1 text-purple-700">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Explanation:</span>
                        </span>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
