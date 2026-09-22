import React, { useMemo } from 'react';
import { Play, Settings2 } from 'lucide-react';
import { JEE_SYLLABUS } from '../../data/syllabusData';

export default function TestConfig({ config, onChangeConfig, onStartTest, isSubmitting }) {
  // Safe chapter retrieval that handles array, nested object, or undefined
  const availableChapters = useMemo(() => {
    try {
      if (!config.subject || config.subject === 'All' || config.subject === 'Full Syllabus') {
        return ['All'];
      }

      if (!JEE_SYLLABUS) return ['All'];
      const data = JEE_SYLLABUS[config.subject];
      if (!data) return ['All'];

      if (Array.isArray(data)) {
        return ['All', ...data.filter(c => c && c !== 'All')];
      }

      if (typeof data === 'object') {
        const list = [];
        Object.keys(data).forEach(key => {
          const item = data[key];
          if (Array.isArray(item)) {
            list.push(...item);
          } else if (typeof item === 'string') {
            list.push(item);
          }
        });
        return ['All', ...Array.from(new Set(list.filter(c => c && c !== 'All')))];
      }
    } catch (e) {
      console.warn('Error reading chapters in TestConfig:', e);
    }
    return ['All'];
  }, [config.subject]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onStartTest === 'function') {
      onStartTest();
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
          <Settings2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Configure Practice Exam</h2>
          <p className="text-xs text-slate-400">Select your target subject, chapters, and test duration.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Subject Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject</label>
          <select
            value={config.subject || 'All'}
            onChange={(e) => onChangeConfig({ ...config, subject: e.target.value, chapter: 'All' })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition"
          >
            <option value="All">All Subjects (P + C + M)</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
          </select>
        </div>

        {/* Chapter Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Chapter</label>
          <select
            disabled={config.subject === 'All' || config.subject === 'Full Syllabus'}
            value={config.chapter || 'All'}
            onChange={(e) => onChangeConfig({ ...config, chapter: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-40 transition"
          >
            {availableChapters.map((ch, idx) => (
              <option key={idx} value={ch}>
                {ch === 'All' ? 'All Chapters' : ch}
              </option>
            ))}
          </select>
        </div>

        {/* Grid: Question Count & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Question Count</label>
            <input
              type="number"
              min="5"
              max="75"
              value={config.questionCount || 10}
              onChange={(e) => onChangeConfig({ ...config, questionCount: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Duration (Minutes)</label>
            <input
              type="number"
              min="5"
              max="180"
              value={config.durationMinutes || 30}
              onChange={(e) => onChangeConfig({ ...config, durationMinutes: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
        >
          <Play className="w-4 h-4 fill-current" /> {isSubmitting ? 'Preparing Exam...' : 'Start Practice CBT'}
        </button>
      </form>
    </div>
  );
}