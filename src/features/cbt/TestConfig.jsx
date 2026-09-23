import React, { useMemo } from 'react';
import { Play, Settings2, RotateCcw } from 'lucide-react';
import { JEE_SYLLABUS } from '../../data/syllabusData';
import { NEET_SYLLABUS } from '../../data/neetSyllabusData';
import { getExamConfig } from '../../config/examConfig';

export default function TestConfig({ config, onChangeConfig, onStartTest, isSubmitting, exam = 'JEE Main' }) {
  const examConfig = getExamConfig(exam);
  const isNeet = exam === 'NEET';
  const syllabus = exam === 'NEET' ? NEET_SYLLABUS : JEE_SYLLABUS;
  const safeSubject = config?.subject || 'All';
  const selectedChapters = Array.isArray(config?.selectedChapters) 
    ? config.selectedChapters 
    : ['All'];

  // Dynamically extract all available chapters for the selected subject
  const availableChapters = useMemo(() => {
    let list = [];

    const getChaptersForSubject = (subKey) => {
      try {
        if (!syllabus) return [];
        const data = syllabus[subKey];
        if (!data) return [];

        if (Array.isArray(data)) {
          return data;
        }

        if (typeof data === 'object') {
          let nested = [];
          Object.keys(data).forEach((k) => {
            const val = data[k];
            if (Array.isArray(val)) {
              nested.push(...val);
            } else if (typeof val === 'string') {
              nested.push(val);
            }
          });
          return nested;
        }
      } catch (err) {
        console.warn('Error reading syllabus for ' + subKey, err);
      }
      return [];
    };

    if (safeSubject === 'All' || safeSubject === 'Full Syllabus') {
      examConfig.subjects.forEach((s) => {
        list.push(...getChaptersForSubject(s));
      });
    } else {
      list.push(...getChaptersForSubject(safeSubject));
    }

    return Array.from(new Set(list.filter((c) => c && typeof c === 'string' && c !== 'All')));
  }, [safeSubject, exam, syllabus, examConfig.subjects]);

  // Handle multi-chapter chip toggling
  const handleToggleChapter = (ch) => {
    if (ch === 'All') {
      onChangeConfig({
        ...config,
        selectedChapters: ['All'],
        chapter: 'All'
      });
      return;
    }

    let updated = selectedChapters.filter((c) => c !== 'All');
    if (updated.includes(ch)) {
      updated = updated.filter((c) => c !== ch);
    } else {
      updated.push(ch);
    }

    if (updated.length === 0) {
      updated = ['All'];
    }

    onChangeConfig({
      ...config,
      selectedChapters: updated,
      chapter: updated.includes('All') ? 'All' : updated.join(', ')
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onStartTest === 'function') {
      onStartTest();
    }
  };

  const durationPresets = isNeet
    ? [{ minutes: 60, questions: 100 }, { minutes: 120, questions: 200 }, { minutes: 180, questions: 300 }]
    : [{ minutes: 60, questions: 25 }, { minutes: 120, questions: 50 }, { minutes: 180, questions: 75 }];
  const selectedDuration = Number(config?.durationMinutes) || 60;

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isNeet ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'}`}>
          <Settings2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Configure {examConfig.label} Practice Exam</h2>
          <p className="text-xs text-slate-400">Select {examConfig.label} subjects, chapters, and test duration.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Subject Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject</label>
          <select
            value={safeSubject}
            onChange={(e) => {
              const newSub = e.target.value;
              onChangeConfig({
                ...config,
                subject: newSub,
                selectedChapters: ['All'],
                chapter: 'All'
              });
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition"
          >
            <option value="All">All Subjects ({examConfig.subjects.join(' + ')})</option>
            {examConfig.subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
          </select>
        </div>

        {/* Multi-Chapter Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300">
              Chapters Selected ({selectedChapters.includes('All') ? 'All Chapters' : selectedChapters.length})
            </label>
            <button
              type="button"
              onClick={() => handleToggleChapter('All')}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" /> Reset to All
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap gap-1.5">
            {/* All Chapters Chip */}
            <button
              type="button"
              onClick={() => handleToggleChapter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedChapters.includes('All')
                  ? isNeet ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Chapters
            </button>

            {/* Individual Chapter Chips */}
            {availableChapters.map((ch, idx) => {
              const isSelected = !selectedChapters.includes('All') && selectedChapters.includes(ch);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleToggleChapter(ch)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    isSelected
                      ? isNeet ? 'bg-emerald-600 text-white shadow-sm' : 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        </div>

        {/* Test Duration */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Test Duration</label>
          <div className="grid grid-cols-3 gap-2">
            {durationPresets.map((preset) => {
              const selected = selectedDuration === preset.minutes;
              return (
                <button
                  key={preset.minutes}
                  type="button"
                  onClick={() => onChangeConfig({ ...config, durationMinutes: preset.minutes, questionCount: preset.questions })}
                  className={`py-3 rounded-xl border text-xs font-bold transition ${selected ? (isNeet ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20' : 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20') : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'}`}
                >
                  <span className="block">{preset.minutes} Minutes</span>
                  <span className="block mt-1 text-[10px] font-medium opacity-80">{preset.questions} Questions</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
        >
          <Play className="w-4 h-4 fill-current" /> {isSubmitting ? 'Preparing Practice CBT...' : 'Start Practice CBT'}
        </button>
      </form>
    </div>
  );
}