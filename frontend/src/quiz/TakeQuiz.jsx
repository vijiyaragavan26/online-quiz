import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptService } from '../services/api';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Flag,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';

const TakeQuiz = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600); // 10 mins default
  const [totalSeconds, setTotalSeconds] = useState(600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // 1. Initialize Attempt Session
  useEffect(() => {
    const initAttempt = async () => {
      try {
        const res = await attemptService.startAttempt(quizId);
        if (res.success && res.quiz) {
          setQuiz(res.quiz);
          setAttemptId(res.attemptId);

          const limitSec = (res.quiz.timeLimit || 10) * 60;
          setTimeLeftSeconds(limitSec);
          setTotalSeconds(limitSec);
          startTimeRef.current = Date.now();
        } else {
          setError(res.message || 'Failed to start quiz attempt session.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load quiz questions.');
      } finally {
        setLoading(false);
      }
    };

    initAttempt();
  }, [quizId]);

  // 2. Countdown Timer
  useEffect(() => {
    if (!quiz || isSubmitting || hasAutoSubmitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [quiz, isSubmitting, hasAutoSubmitted]);

  // Handle Option Select
  const handleSelectOption = (questionId, optionIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Submit Logic
  const handleSubmit = async (auto = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    clearInterval(timerRef.current);

    const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await attemptService.submitAttempt(attemptId, {
        userAnswers,
        timeTakenSeconds: elapsedSeconds
      });

      if (res.success) {
        navigate(`/quiz/results/${attemptId}`);
      } else {
        setError('Submission failed: ' + res.message);
        setIsSubmitting(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    setHasAutoSubmitted(true);
    setConfirmModalOpen(false);
    handleSubmit(true);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
        <p className="text-base font-semibold text-slate-700">Loading your quiz session...</p>
        <p className="text-xs text-slate-400">Preparing questions and secure scoring engine</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-rose-200 text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Unable to Start Quiz</h3>
          <p className="text-xs text-slate-500 mb-6">{error || 'Quiz not found or unpublished.'}</p>
          <button
            onClick={() => navigate('/explore')}
            className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentIndex];
  const qId = currentQ?._id;
  const selectedAnswer = userAnswers[qId];

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  // Time format
  const mins = Math.floor(timeLeftSeconds / 60);
  const secs = timeLeftSeconds % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isTimeCritical = timeLeftSeconds < 120; // less than 2 mins

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-purple-600 selection:text-white">
      {/* TOP BAR: QUIZ TITLE, PROGRESS & TIMER */}
      <header className="bg-slate-950/80 border-b border-slate-800 backdrop-blur sticky top-0 z-30 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Title & Question Count */}
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              {quiz.category} • {quiz.difficulty}
            </span>
            <h1 className="text-base sm:text-lg font-extrabold text-white truncate max-w-md">
              {quiz.title}
            </h1>
          </div>

          {/* Right: Countdown Timer */}
          <div className="flex items-center space-x-3 shrink-0">
            <div
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border font-mono text-sm font-bold tracking-wider transition-colors ${
                isTimeCritical
                  ? 'bg-rose-950/80 border-rose-500/80 text-rose-300 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-400' : 'text-purple-400'}`} />
              <span>{formattedTime}</span>
            </div>

            <button
              onClick={() => setConfirmModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-purple-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Finish Quiz</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-6xl mx-auto mt-3">
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* MAIN QUESTION DISPLAY */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center">
        {currentQ && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur relative">
            {/* Header: Question Number */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
              <span className="font-extrabold uppercase tracking-widest text-purple-400">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className="text-slate-500">
                {answeredCount} of {totalQuestions} Answered
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed mb-8">
              {currentQ.questionText}
            </h2>

            {/* 4 Touch-Friendly Option Cards */}
            <div className="space-y-3.5 mb-10">
              {currentQ.options.map((optionText, optIdx) => {
                const isSelected = selectedAnswer === optIdx;
                const letter = String.fromCharCode(65 + optIdx);

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(qId, optIdx)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-center space-x-4 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-600/20 text-white ring-2 ring-purple-500/40 shadow-lg shadow-purple-600/10'
                        : 'border-slate-700/90 bg-slate-900/60 text-slate-300 hover:border-slate-600 hover:bg-slate-900/90'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {letter}
                    </div>
                    <span className="text-sm sm:text-base font-medium flex-1">
                      {optionText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-700/80">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 font-semibold text-xs flex items-center space-x-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((idx) => Math.min(totalQuestions - 1, idx + 1))}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-purple-600/20"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-600/30"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Quiz</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM QUESTION PALETTE DRAWER */}
      <footer className="bg-slate-950/80 border-t border-slate-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" />
              <span>Current</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>Answered</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700 inline-block" />
              <span>Unanswered</span>
            </span>
          </div>

          {/* Quick Jump Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {questions.map((q, idx) => {
              const isAnswered = userAnswers[q._id] !== undefined;
              const isCurrent = idx === currentIndex;

              let btnClass = 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700';
              if (isAnswered) {
                btnClass = 'bg-emerald-600 text-white border-emerald-500';
              }
              if (isCurrent) {
                btnClass = 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-400/50';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${btnClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </footer>

      {/* SUBMISSION CONFIRMATION MODAL */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Ready to Submit Your Quiz?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                You have answered <span className="font-bold text-purple-400">{answeredCount}</span> of{' '}
                <span className="font-bold text-white">{totalQuestions}</span> questions.
                {answeredCount < totalQuestions && (
                  <span className="block text-amber-400 font-semibold mt-1">
                    ⚠️ You have {totalQuestions - answeredCount} unanswered questions remaining!
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Keep Reviewing
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(false)}
                className="py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-purple-600/30"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Yes, Submit Now</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;
