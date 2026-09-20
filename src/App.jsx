import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Trophy, 
  ArrowRight, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    subject: 'Physics',
    topic: 'Kinematics',
    question: 'A projectile is launched from ground level at an angle of 45° with an initial velocity of 20 m/s. Assuming g = 10 m/s², what is the horizontal range?',
    options: ['20 m', '40 m', '60 m', '80 m'],
    correctIndex: 1,
    explanation: 'Horizontal Range R = (u² * sin(2θ)) / g. For θ = 45°, sin(2θ) = sin(90°) = 1. Therefore, R = (20² * 1) / 10 = 400 / 10 = 40 m.'
  },
  {
    id: 2,
    subject: 'Chemistry',
    topic: 'Thermodynamics',
    question: 'For an isolated system undergoing an irreversible spontaneous process, the change in entropy of the universe (ΔS_universe) is:',
    options: ['Zero', 'Negative', 'Positive', 'Independent of temperature'],
    correctIndex: 2,
    explanation: 'By the Second Law of Thermodynamics, any spontaneous process increases the total entropy of an isolated system/universe, so ΔS_universe > 0.'
  },
  {
    id: 3,
    subject: 'Mathematics',
    topic: 'Calculus',
    question: 'What is the limit of (sin x) / x as x approaches 0?',
    options: ['0', '1', 'Infinity', 'Undefined'],
    correctIndex: 1,
    explanation: 'This is a standard fundamental limit: lim(x -> 0) [sin(x) / x] = 1.'
  }
];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQ = SAMPLE_QUESTIONS[currentIndex];

  const handleSelect = (idx) => {
    if (!isSubmitted) {
      setSelectedOption(idx);
    }
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    if (selectedOption === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    if (currentIndex + 1 < SAMPLE_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
      setScore(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="w-full max-w-3xl flex items-center justify-between py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">ApexPrep</h1>
            <p className="text-xs text-slate-400">JEE & NEET Prep Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-sm">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-200">Score: {score}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-3xl mt-8 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
          {/* Metadata */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs">
            <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 px-2.5 py-1 rounded-md font-medium">
              {currentQ.subject} • {currentQ.topic}
            </span>
            <span className="text-slate-400">
              Question {currentIndex + 1} of {SAMPLE_QUESTIONS.length}
            </span>
          </div>

          {/* Question Text */}
          <p className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed mb-6">
            {currentQ.question}
          </p>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;
              
              let btnClass = 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700 text-slate-300';
              
              if (isSubmitted) {
                if (isCorrect) {
                  btnClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold';
                } else if (isSelected && !isCorrect) {
                  btnClass = 'border-rose-500 bg-rose-500/10 text-rose-300';
                }
              } else if (isSelected) {
                btnClass = 'border-indigo-500 bg-indigo-600/10 text-indigo-300 ring-2 ring-indigo-500/30';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center justify-between ${btnClass}`}
                >
                  <span>
                    <strong className="mr-3 text-slate-500">{String.fromCharCode(65 + idx)}.</strong>
                    {opt}
                  </span>
                  {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isSubmitted && (
            <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="text-sm font-semibold text-indigo-400 mb-1">Explanation</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Footer Controls */}
          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-800">
            {!isSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmit}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-xl transition"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-slate-100 hover:bg-white text-slate-950 font-medium px-6 py-2.5 rounded-xl transition flex items-center gap-2"
              >
                {currentIndex + 1 < SAMPLE_QUESTIONS.length ? 'Next Question' : 'Restart Quiz'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}