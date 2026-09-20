import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import QuestionCard from './QuestionCard';
import { getFilteredQuestions, getAllSubjects } from '../../services/questionService';

export default function QuestionPool() {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const subjects = useMemo(() => getAllSubjects(), []);

  const questions = useMemo(() => {
    return getFilteredQuestions({
      subject: selectedSubject,
      chapter: 'All',
      search: searchQuery
    });
  }, [selectedSubject, searchQuery]);

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/20 text-indigo-400 p-2.5 rounded-xl border border-indigo-600/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Question Pool & PYQ Bank</h2>
            <p className="text-xs text-slate-400">Chapterwise questions with official year tags</p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search topic or year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
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
          questions.map((q, idx) => <QuestionCard key={q.id} data={q} index={idx} />)
        )}
      </div>
    </div>
  );
}