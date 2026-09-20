import React, { useState, useMemo } from 'react';
import { Play, Clock, BookOpen, CheckSquare, Square } from 'lucide-react';
import { getAvailableChaptersFromPool } from '../../services/testEngineService';

export default function TestConfig({ onStart }) {
  const chapterMap = useMemo(() => getAvailableChaptersFromPool(), []);

  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [preset, setPreset] = useState('full'); // 'sprint' | 'half' | 'full'

  const presets = [
    { id: 'sprint', label: 'Sprint Mock', questions: 15, duration: 30, desc: '15 Questions • 30 Minutes' },
    { id: 'half', label: 'Half Mock', questions: 30, duration: 60, desc: '30 Questions • 60 Minutes' },
    { id: 'full', label: 'Full NTA Mock', questions: 75, duration: 180, desc: '75 Questions • 180 Minutes (Official)' }
  ];

  const currentAvailableChapters = useMemo(() => {
    if (selectedSubject === 'All') {
      return [...chapterMap.Physics, ...chapterMap.Chemistry, ...chapterMap.Math];
    }
    return chapterMap[selectedSubject] || [];
  }, [selectedSubject, chapterMap]);

  const toggleChapter = (ch) => {
    setSelectedChapters((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const toggleAllChapters = () => {
    if (selectedChapters.length === currentAvailableChapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters([...currentAvailableChapters]);
    }
  };

  const handleLaunch = () => {
    const chosenPreset = presets.find((p) => p.id === preset);
    onStart({
      subject: selectedSubject,
      selectedChapters,
      questionCount: chosenPreset.questions,
      durationMinutes: chosenPreset.duration
    });
  };

  return (
    <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-sm rounded-xl p-6 md:p-8 flex flex-col gap-6 text-slate-800">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          JEE Main CBT Test Configurator
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Select test preset, subjects, and specific chapters before launching the examination.
        </p>
      </div>

      {/* Preset Pickers */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
          1. Select Test Format & Duration
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((p) => {
            const active = preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={`p-3.5 rounded-lg border text-left transition flex flex-col justify-between ${
                  active
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className={`text-sm font-bold ${active ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {p.label}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{p.desc}</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 mt-3 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {p.duration} mins
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
          2. Subject Scope
        </label>
        <div className="grid grid-cols-4 gap-2">
          {['All', 'Physics', 'Chemistry', 'Math'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setSelectedSubject(s); setSelectedChapters([]); }}
              className={`py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                selectedSubject === s
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {s === 'Math' ? 'Mathematics' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Chapter Checkbox Multiselect */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            3. Specific Chapter Filters (Optional)
          </label>
          <button
            type="button"
            onClick={toggleAllChapters}
            className="text-xs text-indigo-600 hover:underline font-semibold"
          >
            {selectedChapters.length === currentAvailableChapters.length ? 'Clear All' : 'Select All'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
          {currentAvailableChapters.map((ch) => {
            const isChecked = selectedChapters.includes(ch);
            return (
              <button
                key={ch}
                type="button"
                onClick={() => toggleChapter(ch)}
                className={`flex items-center gap-2 p-1.5 rounded text-left text-xs transition ${
                  isChecked ? 'bg-indigo-100/70 text-indigo-950 font-medium' : 'hover:bg-white text-slate-700'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className="truncate">{ch}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-400">
          {selectedChapters.length === 0
            ? 'All available chapters will be covered.'
            : `${selectedChapters.length} chapter(s) selected.`}
        </p>
      </div>

      <button
        onClick={handleLaunch}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-sm text-sm cursor-pointer"
      >
        <Play className="w-4 h-4 fill-white" /> Start Examination
      </button>
    </div>
  );
}