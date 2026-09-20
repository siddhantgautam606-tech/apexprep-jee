import React, { useState, useEffect } from 'react';
import { X, Clock, Sparkles, CheckCircle2, ChevronRight, Award, RotateCcw } from 'lucide-react';
import { QUESTIONS_POOL } from '../data/questionsPool';

export default function ChapterReaderModal({ subtopic, subject, onClose, onRecordScore }) {
  const [viewMode, setViewMode] = useState('read'); // 'read' or 'practice'
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1200); // 20 mins
  const [isFinished, setIsFinished] = useState(false);

  // Load questions for this subtopic from the pool
  useEffect(() => {
    if (!subtopic) return;
    const matched = QUESTIONS_POOL.filter(q => q.subtopicId === subtopic.id);
    setQuestions(matched.length > 0 ? matched : QUESTIONS_POOL.slice(0, 5));
    setViewMode('read');
    setIsFinished(false);
    setSelectedAnswers({});
    setTimeLeft(1200);
    setCurrentIdx(0);
  }, [subtopic]);

  // 20-min Practice Timer
  useEffect(() => {
    let timer;
    if (viewMode === 'practice' && !isFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [viewMode, isFinished, timeLeft]);

  if (!subtopic) return null;

  const handleFinish = () => {
    setIsFinished(true);
    let score = 0;
    let correct = 0;
    let attempted = 0;

    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] !== undefined) {
        attempted++;
        if (selectedAnswers[idx] === q.correctIndex) {
          score += 4;
          correct++;
        } else {
          score -= 1;
        }
      }
    });

    if (onRecordScore) {
      onRecordScore({
        subtopicId: subtopic.id,
        subtopicTitle: subtopic.title,
        subject: subject,
        score,
        totalPossible: questions.length * 4,
        accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  };

  const formatTimer = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col text-slate-100 overflow-hidden animate-in fade-in duration-200">
      {/* Modal Top Header */}
      <header className="h-16 px-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 capitalize">
            {subject}
          </span>
          <h2 className="text-base font-bold text-white truncate max-w-md sm:max-w-xl">
            {subtopic.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {viewMode === 'practice' && !isFinished && (
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-emerald-400 font-mono text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              {formatTimer(timeLeft)}
            </div>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Exit full screen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full">
        {viewMode === 'read' ? (
          <div className="space-y-6">
            {/* Analogy / Intuition Box */}
            <div className="bg-blue-950/30 border border-blue-800/40 rounded-2xl p-5">
              <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" /> Practical Intuition & Analogy
              </h4>
              <p className="text-slate-200 text-sm leading-relaxed">{subtopic.analogy}</p>
            </div>

            {/* Core Theory */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-3">Core Theory & Mechanics</h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{subtopic.theory}</p>
            </div>

            {/* Formulas Vault */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-3">Key Formula Vault</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subtopic.keyFormulas.map((f, i) => (
                  <div key={i} className="bg-slate-800/70 border border-slate-700/60 p-3.5 rounded-xl font-mono text-xs text-blue-300">
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Worked Example */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-1">Standard Worked Example</h3>
              <p className="text-slate-300 text-sm font-medium italic mb-4">{subtopic.workedExample.problem}</p>
              <div className="space-y-2 border-l-2 border-blue-500/40 pl-4">
                {subtopic.workedExample.steps.map((st, i) => (
                  <p key={i} className="text-xs text-slate-400 leading-relaxed">{st}</p>
                ))}
              </div>
            </div>

            {/* Transition to Practice Session */}
            <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-emerald-900/30 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-white">Finished learning this subtopic?</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Test your grasp with a 20-minute timed PYQ drill ({questions.length} questions from this pool).
                </p>
              </div>
              <button
                onClick={() => setViewMode('practice')}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2 flex-shrink-0"
              >
                <Clock className="w-4 h-4" /> Start 20-Min Practice
              </button>
            </div>
          </div>
        ) : !isFinished ? (
          /* Subtopic Practice Session */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-blue-400">{questions[currentIdx]?.yearTag}</span>
                <h3 className="text-sm font-bold text-white mt-1">
                  Question {currentIdx + 1} of {questions.length}
                </h3>
              </div>
              <button
                onClick={() => setViewMode('read')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back to Theory
              </button>
            </div>

            <p className="text-base font-medium text-slate-200 leading-relaxed">
              {questions[currentIdx]?.text}
            </p>

            <div className="space-y-3">
              {questions[currentIdx]?.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentIdx]: oIdx }))}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition flex items-center justify-between ${
                    selectedAnswers[currentIdx] === oIdx
                      ? 'bg-blue-600/20 border-blue-500 text-white font-medium'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span><strong className="mr-2 text-slate-400">{String.fromCharCode(65 + oIdx)}.</strong> {opt}</span>
                  {selectedAnswers[currentIdx] === oIdx && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => prev - 1)}
                className="text-xs text-slate-400 hover:text-white disabled:opacity-30"
              >
                Previous
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-xs font-semibold"
                >
                  Submit Practice
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Instant Practice Results */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-center space-y-6">
            <div className="p-4 bg-blue-500/10 text-blue-400 rounded-full inline-block">
              <Award className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Practice Session Complete!</h3>
              <p className="text-xs text-slate-400 mt-1">Review the step-by-step solutions below</p>
            </div>

            <div className="text-left space-y-4">
              {questions.map((q, idx) => {
                const isCorrect = selectedAnswers[idx] === q.correctIndex;
                const isAttempted = selectedAnswers[idx] !== undefined;

                return (
                  <div key={q.id} className="bg-slate-800/40 border border-slate-800 p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400">{q.yearTag}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        !isAttempted ? 'bg-slate-700 text-slate-300' : isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {!isAttempted ? 'Unattempted (0)' : isCorrect ? 'Correct (+4)' : 'Incorrect (-1)'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-200 mb-3">{q.text}</p>
                    <div className="bg-slate-900/70 p-3 rounded-xl text-xs text-slate-300 border border-slate-800">
                      <span className="text-blue-400 font-bold block mb-1">Correct Answer: {q.options[q.correctIndex]}</span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setTimeLeft(1200);
                  setIsFinished(false);
                  setCurrentIdx(0);
                }}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake Practice
              </button>
              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-xs font-semibold"
              >
                Done Reading
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}