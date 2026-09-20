import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Tag } from 'lucide-react';

export default function QuestionCard({ data, index }) {
  const [showSolution, setShowSolution] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const difficultyColors = {
    Easy: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
    Medium: 'text-amber-400 bg-amber-950/60 border-amber-800',
    Hard: 'text-rose-400 bg-rose-950/60 border-rose-800'
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md transition hover:border-slate-700">
      {/* Meta tags */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-md font-medium">
            {data.subject} • {data.chapter}
          </span>
          <span className={`px-2.5 py-1 rounded-md border font-medium ${difficultyColors[data.difficulty] || ''}`}>
            {data.difficulty}
          </span>
        </div>
        <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px] bg-slate-800/60 px-2 py-1 rounded border border-slate-700">
          <Tag className="w-3 h-3 text-slate-400" />
          {data.yearTag}
        </span>
      </div>

      {/* Question */}
      <div className="text-slate-100 font-medium text-base mb-5 leading-relaxed">
        <span className="text-slate-500 font-semibold mr-2">Q{index + 1}.</span>
        {data.question}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {data.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === data.correctIndex;
          let style = 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700';

          if (showSolution) {
            if (isCorrect) style = 'bg-emerald-950/60 border-emerald-600 text-emerald-300 font-medium';
            else if (isSelected) style = 'bg-rose-950/60 border-rose-600 text-rose-300';
          } else if (isSelected) {
            style = 'bg-indigo-950 border-indigo-500 text-indigo-200';
          }

          return (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`text-left px-4 py-3 rounded-xl border text-sm transition flex items-center justify-between ${style}`}
            >
              <span>
                <strong className="text-slate-500 mr-2">{String.fromCharCode(65 + idx)}.</strong>
                {option}
              </span>
              {showSolution && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Solution Toggle */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-3">
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="self-start text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition"
        >
          {showSolution ? (
            <>
              Hide Solution <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show Explanation & Answer <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>

        {showSolution && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-emerald-400 block mb-1">
              Correct Answer: Option {String.fromCharCode(65 + data.correctIndex)} ({data.options[data.correctIndex]})
            </span>
            {data.explanation}
          </div>
        )}
      </div>
    </div>
  );
}