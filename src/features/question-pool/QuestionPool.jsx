import { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, Plus, X } from 'lucide-react';
import QuestionCard from './QuestionCard';
import { getFilteredQuestions, getAllSubjects, appendQuestion } from '../../services/questionService';
import { normalizeExam, getExamConfig } from '../../config/examConfig';

export default function QuestionPool({ currentUser, feedExam }) {
  const exam = normalizeExam(feedExam || currentUser?.target_exam);
  const examConfig = getExamConfig(exam);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    subject: examConfig.subjects[0],
    chapter: '',
    yearTag: exam === 'NEET' ? 'NEET Practice' : 'JEE Main 2025',
    difficulty: 'Medium',
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: ''
  });

  const subjects = useMemo(() => getAllSubjects(exam), [refreshTrigger, exam]);

  const questions = useMemo(() => {
    return getFilteredQuestions({
      subject: selectedSubject,
      chapter: 'All',
      search: searchQuery,
      exam
    });
  }, [selectedSubject, searchQuery, refreshTrigger, exam]);

  const handleOptionChange = (idx, value) => {
    const updated = [...formData.options];
    updated[idx] = value;
    setFormData({ ...formData, options: updated });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.question.trim() || formData.options.some((o) => !o.trim())) {
      alert('Please fill in the question and all 4 options.');
      return;
    }

    appendQuestion(formData);
    setShowAddModal(false);
    setRefreshTrigger((prev) => prev + 1);

    // Reset form
    setFormData({
      subject: examConfig.subjects[0],
      chapter: '',
      yearTag: exam === 'NEET' ? 'NEET Practice' : 'JEE Main 2025',
      difficulty: 'Medium',
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: ''
    });
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className={exam === 'NEET' ? 'bg-emerald-600/20 text-emerald-400 p-2.5 rounded-xl border border-emerald-600/30' : 'bg-indigo-600/20 text-indigo-400 p-2.5 rounded-xl border border-indigo-600/30'}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{exam} Question Pool & PYQ Bank</h2>
            <p className="text-xs text-slate-400">Chapterwise questions with official year tags</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search topic or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition ${exam === 'NEET' ? 'focus:border-emerald-500' : 'focus:border-indigo-500'}`}
            />
          </div>
          {currentUser?.is_admin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow transition shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          )}
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-slate-500 mr-1 shrink-0" />
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
              selectedSubject === sub
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {sub}
          </button>
        ))}
        <span className="text-xs text-slate-500 ml-auto shrink-0">
          Showing {questions.length} questions
        </span>
      </div>

      {/* Questions list */}
      <div className="flex flex-col gap-4">
        {questions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900/50 border border-slate-800 rounded-2xl text-sm">
            No questions match your current search criteria.
          </div>
        ) : (
          questions.map((q, idx) => <QuestionCard key={q.id} question={q} index={idx} />)
        )}
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Append New Question</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    {examConfig.subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Chapter</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thermodynamics"
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Year / Exam Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. JEE Main 2025"
                    value={formData.yearTag}
                    onChange={(e) => setFormData({ ...formData, yearTag: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Question Text</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter the full question statement..."
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-slate-400">Options & Correct Choice</label>
                {formData.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={formData.correctIndex === i}
                      onChange={() => setFormData({ ...formData, correctIndex: i })}
                    />
                    <span className="font-mono text-slate-400">{String.fromCharCode(65 + i)}:</span>
                    <input
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Step-by-step Solution</label>
                <textarea
                  rows={2}
                  placeholder="Explanation..."
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 font-semibold"
                >
                  Save to Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}