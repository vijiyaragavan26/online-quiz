import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle,
  Trash2,
  CheckCircle,
  HelpCircle,
  Clock,
  Award,
  Globe,
  Lock,
  Eye,
  Save,
  AlertCircle,
  Loader2,
  Check,
  ChevronDown,
  Layers,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

const categories = [
  'Web Development',
  'Programming',
  'Science',
  'History',
  'Mathematics',
  'General Knowledge',
  'Design',
  'Business'
];

const difficulties = ['Easy', 'Medium', 'Hard'];

const emptyQuestion = () => ({
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  explanation: ''
});

const CreateQuiz = () => {
  const { id } = useParams(); // If editing an existing quiz
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [difficulty, setDifficulty] = useState('Medium');
  const [timeLimit, setTimeLimit] = useState(10);
  const [passingScore, setPassingScore] = useState(60);
  const [isPublic, setIsPublic] = useState(true);
  const [isPublished, setIsPublished] = useState(true);

  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  // If editing, load quiz data
  useEffect(() => {
    if (isEditing) {
      const loadQuiz = async () => {
        try {
          const res = await quizService.getQuizById(id);
          if (res.success && res.quiz) {
            const q = res.quiz;
            setTitle(q.title || '');
            setDescription(q.description || '');
            setCategory(q.category || 'Web Development');
            setDifficulty(q.difficulty || 'Medium');
            setTimeLimit(q.timeLimit || 10);
            setPassingScore(q.passingScore || 60);
            setIsPublic(q.isPublic !== undefined ? q.isPublic : true);
            setIsPublished(q.isPublished !== undefined ? q.isPublished : true);

            if (q.questions && q.questions.length > 0) {
              setQuestions(
                q.questions.map((qn) => ({
                  questionText: qn.questionText || '',
                  options: qn.options || ['', '', '', ''],
                  correctAnswer: qn.correctAnswer !== undefined ? qn.correctAnswer : 0,
                  explanation: qn.explanation || ''
                }))
              );
            }
          }
        } catch (err) {
          setError('Failed to load quiz for editing.');
        } finally {
          setFetchLoading(false);
        }
      };
      loadQuiz();
    }
  }, [id, isEditing]);

  // Question Management
  const handleAddQuestion = () => {
    setQuestions([...questions, emptyQuestion()]);
    setActiveQuestionIndex(questions.length);
  };

  const handleDeleteQuestion = (index) => {
    if (questions.length <= 1) {
      setError('A quiz must have at least one question.');
      return;
    }
    const updated = questions.filter((_, idx) => idx !== index);
    setQuestions(updated);
    if (activeQuestionIndex >= updated.length) {
      setActiveQuestionIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleQuestionTextChange = (text) => {
    const updated = [...questions];
    updated[activeQuestionIndex].questionText = text;
    setQuestions(updated);
  };

  const handleOptionChange = (optIndex, value) => {
    const updated = [...questions];
    updated[activeQuestionIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (optIndex) => {
    const updated = [...questions];
    updated[activeQuestionIndex].correctAnswer = optIndex;
    setQuestions(updated);
  };

  const handleExplanationChange = (text) => {
    const updated = [...questions];
    updated[activeQuestionIndex].explanation = text;
    setQuestions(updated);
  };

  // Form Validation
  const validateForm = () => {
    if (!title.trim()) {
      setError('Please provide a quiz title.');
      return false;
    }
    if (!description.trim()) {
      setError('Please provide a quiz description.');
      return false;
    }
    if (timeLimit < 1 || timeLimit > 180) {
      setError('Time limit must be between 1 and 180 minutes.');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question #${i + 1} has no question text.`);
        setActiveQuestionIndex(i);
        return false;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j] || !q.options[j].trim()) {
          setError(`Question #${i + 1}, Option ${String.fromCharCode(65 + j)} cannot be empty.`);
          setActiveQuestionIndex(i);
          return false;
        }
      }
      if (q.correctAnswer < 0 || q.correctAnswer > 3) {
        setError(`Question #${i + 1} must have a valid correct answer marked.`);
        setActiveQuestionIndex(i);
        return false;
      }
    }
    return true;
  };

  const handleSave = async (publishedState = true) => {
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        timeLimit: Number(timeLimit),
        passingScore: Number(passingScore),
        isPublic,
        isPublished: publishedState,
        questions
      };

      if (isEditing) {
        await quizService.updateQuiz(id, payload);
      } else {
        await quizService.createQuiz(payload);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-sm text-slate-500">Loading quiz details...</p>
      </div>
    );
  }

  const currentQ = questions[activeQuestionIndex] || emptyQuestion();

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-purple-600 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isEditing ? 'Edit Quiz' : 'Create a New Quiz'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Design comprehensive assessments with custom questions, time limits, and explanations.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <Eye className="w-4 h-4 text-purple-600" />
              <span>Preview Quiz</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-purple-600/25 transition-all hover:scale-[1.02]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isEditing ? 'Update & Publish' : 'Publish Quiz'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2 shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TWO-COLUMN LAYOUT: METADATA & QUESTION BUILDER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: QUIZ METADATA */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Quiz Details</span>
              </h2>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master React Hooks & Router"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Description *
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain what learners will be tested on..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:border-purple-500 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {difficulties.map((diff) => (
                    <button
                      type="button"
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        difficulty === diff
                          ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Limit & Passing Score */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Time Limit</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                      mins
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pass Score</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={passingScore}
                      onChange={(e) => setPassingScore(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Visibility Options */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Visibility
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center space-x-1.5 transition-all ${
                      isPublic
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Public</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center space-x-1.5 transition-all ${
                      !isPublic
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Private</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: QUESTIONS BUILDER */}
          <div className="lg:col-span-2 space-y-6">
            {/* Questions Tabs Header */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between overflow-x-auto gap-2">
              <div className="flex items-center space-x-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${
                      activeQuestionIndex === idx
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3.5 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center space-x-1.5 transition-colors shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Active Question Editor */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-xs uppercase tracking-wider font-extrabold text-purple-600">
                  Question {activeQuestionIndex + 1} of {questions.length}
                </span>

                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(activeQuestionIndex)}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Question</span>
                  </button>
                )}
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Question Text *
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter the question clearly..."
                  value={currentQ.questionText}
                  onChange={(e) => handleQuestionTextChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                />
              </div>

              {/* 4 Options Grid */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Answer Options (Select the radio to mark exactly one correct answer) *
                </label>

                {[0, 1, 2, 3].map((optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isCorrect = currentQ.correctAnswer === optIdx;

                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${
                        isCorrect
                          ? 'border-emerald-400 bg-emerald-50/50 ring-1 ring-emerald-300'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleCorrectAnswerChange(optIdx)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-emerald-500 text-transparent'
                        }`}
                        title="Mark as correct answer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <div className="w-6 text-center font-bold text-xs text-slate-500">
                        {letter}
                      </div>

                      <input
                        type="text"
                        placeholder={`Option ${letter} text`}
                        value={currentQ.options[optIdx]}
                        onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                        className="flex-1 bg-transparent text-sm text-slate-800 outline-none"
                      />

                      {isCorrect && (
                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 shrink-0">
                          Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Optional Explanation */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center space-x-1">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                  <span>Optional Explanation (Revealed after submission)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why this answer is correct to help students learn..."
                  value={currentQ.explanation}
                  onChange={(e) => handleExplanationChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PREVIEW MODAL */}
        {previewOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-2xl w-full rounded-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs uppercase font-bold text-purple-600">Quiz Preview</span>
                  <h3 className="text-xl font-extrabold text-slate-900">{title || 'Untitled Quiz'}</h3>
                </div>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-slate-600">{description || 'No description provided.'}</p>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <p className="text-sm font-bold text-slate-900">
                      {idx + 1}. {q.questionText || 'Question text not specified'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border ${
                            q.correctAnswer === oIdx
                              ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-800'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt || '(Empty option)'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateQuiz;
