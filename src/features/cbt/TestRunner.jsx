import React, { useState, useEffect, useRef } from 'react';
import { computeExamStats } from '../../services/testEngineService';
import { saveTestAttempt } from '../../services/analyticsService';
import { ShieldAlert } from 'lucide-react';

export default function TestRunner({ testQuestions, durationMinutes, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [visited, setVisited] = useState(new Set([testQuestions[0]?.id]));
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [examResults, setExamResults] = useState(null);

  // Anti-cheat state
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);
  const maxAllowedSwitches = 2;

  const q = testQuestions[currentIndex];

  const examSubmittedRef = useRef(examSubmitted);
  examSubmittedRef.current = examSubmitted;

  // Countdown timer
  useEffect(() => {
    if (examSubmitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examSubmitted, timeLeft]);

  // Tab-switch & page leave detection
  useEffect(() => {
    if (examSubmitted) return;

    const handleBeforeUnload = (e) => {
      if (!examSubmittedRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !examSubmittedRef.current) {
        setTabSwitchWarnings((prev) => {
          const nextCount = prev + 1;
          if (nextCount > maxAllowedSwitches) {
            handleSubmitExam(false);
          } else {
            setShowCheatWarning(true);
          }
          return nextCount;
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [examSubmitted]);

  const formatTimer = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const markVisited = (id) => {
    setVisited((prev) => new Set(prev).add(id));
  };

  const selectOption = (key) => {
    if (examSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [q.id]: key }));
  };

  const saveNumericalAnswer = (val) => {
    if (examSubmitted) return;
    setUserAnswers((prev) => {
      const updated = { ...prev };
      if (!val || val.trim() === '') delete updated[q.id];
      else updated[q.id] = val.trim();
      return updated;
    });
  };

  const clearResponse = () => {
    if (examSubmitted) return;
    setUserAnswers((prev) => {
      const updated = { ...prev };
      delete updated[q.id];
      return updated;
    });
  };

  const toggleReview = () => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(q.id)) next.delete(q.id);
      else next.add(q.id);
      return next;
    });
  };

  const jumpToQuestion = (id) => {
    const idx = testQuestions.findIndex((item) => item.id === id);
    if (idx !== -1) {
      setCurrentIndex(idx);
      markVisited(id);
    }
  };

  const switchSubject = (subj) => {
    const target = testQuestions.find((item) => item.subject === subj);
    if (target) {
      jumpToQuestion(target.id);
    }
  };

  const handleSubmitExam = (confirmPrompt = true) => {
    if (confirmPrompt) {
      const answeredCount = Object.keys(userAnswers).length;
      if (!window.confirm(`You have answered ${answeredCount} of ${testQuestions.length} questions.\n\nAre you sure you want to submit your exam?`)) {
        return;
      }
    }
    const res = computeExamStats(testQuestions, userAnswers);
    setExamResults(res);
    setExamSubmitted(true);
    setShowModal(true);

    saveTestAttempt({
      testQuestions,
      userAnswers,
      examResults: res,
      durationMinutes
    });
  };

  const answeredCount = Object.keys(userAnswers).length;
  const unvisitedCount = testQuestions.length - visited.size;
  const curAnswer = userAnswers[q?.id];

  return (
    <div className="w-full flex flex-col bg-slate-100 text-slate-800 min-h-screen">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded font-black flex items-center justify-center text-base">
              NTA
            </div>
            <div>
              <div className="text-sm md:text-base font-bold leading-tight">
                JEE (Main) Mock Exam - Proctored Session
              </div>
              <div className="text-xs text-slate-400">
                Physics • Chemistry • Mathematics • {testQuestions.length} Questions • {testQuestions.length * 4} Marks
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 border border-slate-700 px-3 py-1 rounded text-right">
              <span className="text-[9px] uppercase text-slate-400 font-bold block">Time Remaining</span>
              <span className="font-mono text-base md:text-lg font-bold text-amber-500">
                {formatTimer(timeLeft)}
              </span>
            </div>
            {!examSubmitted ? (
              <button
                onClick={() => handleSubmitExam(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-xs font-bold transition cursor-pointer"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded text-xs font-bold transition cursor-pointer"
              >
                View Scorecard
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-800 border-t border-slate-700 px-4">
          <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto">
            {['Physics', 'Chemistry', 'Math'].map((s) => {
              const isActive = q.subject === s;
              return (
                <button
                  key={s}
                  onClick={() => switchSubject(s)}
                  className={`py-2 px-4 text-xs font-semibold border-b-2 whitespace-nowrap cursor-pointer transition ${
                    isActive
                      ? 'bg-slate-900 text-indigo-400 border-indigo-400'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  Part {s === 'Physics' ? 'I' : s === 'Chemistry' ? 'II' : 'III'}: {s === 'Math' ? 'Mathematics' : s}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl w-full mx-auto p-4 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Question Panel */}
        <section className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white font-bold px-2 py-0.5 rounded text-[11px]">
                Q. {q.id}
              </span>
              <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase">
                {q.section}
              </span>
              <span className="text-slate-500 font-semibold">{q.meta}</span>
            </div>
            <div className="flex gap-2 font-mono text-[11px]">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                +4 Correct
              </span>
              <span className="bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded">
                -1 Wrong
              </span>
            </div>
          </div>

          <div className="p-5 flex-1 overflow-y-auto flex flex-col">
            <div
              className="text-base font-medium text-slate-900 leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ __html: q.text }}
            />

            {q.graphicSvg && (
              <div
                className="flex justify-center my-3"
                dangerouslySetInnerHTML={{ __html: q.graphicSvg }}
              />
            )}

            {q.type === 'MCQ' ? (
              <div className="flex flex-col gap-2.5 my-2">
                {q.options.map((opt) => {
                  const isChecked = curAnswer === opt.key;
                  let itemStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';

                  if (examSubmitted) {
                    if (opt.key === q.correct) itemStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                    else if (isChecked && opt.key !== q.correct) itemStyle = 'bg-rose-50 border-rose-500 text-rose-900 line-through';
                  } else if (isChecked) {
                    itemStyle = 'bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold';
                  }

                  return (
                    <label
                      key={opt.key}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-sm transition ${itemStyle}`}
                    >
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value={opt.key}
                        checked={isChecked}
                        disabled={examSubmitted}
                        onChange={() => selectOption(opt.key)}
                        className="hidden"
                      />
                      <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                        ({opt.key.toLowerCase()})
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="max-w-md bg-slate-50 border border-slate-200 rounded-lg p-4 my-2">
                <label className="block text-[11px] uppercase font-bold text-slate-600 mb-2">
                  Enter Integer Answer:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={curAnswer || ''}
                    disabled={examSubmitted}
                    onChange={(e) => saveNumericalAnswer(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full text-lg font-mono font-bold p-2 border border-slate-300 rounded bg-white outline-none focus:border-indigo-500"
                  />
                  {examSubmitted && (
                    <span className="font-mono font-bold text-xs p-2 bg-slate-200 rounded shrink-0">
                      Key: {q.correct}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Marking: +4 for correct, -1 for incorrect.
                </p>
              </div>
            )}

            {examSubmitted && (
              <div className="mt-5 bg-amber-50 border border-dashed border-amber-300 p-3.5 rounded-lg text-xs leading-relaxed text-amber-950">
                <div className="font-bold uppercase text-[11px] text-amber-800 mb-1">
                  • Solution & Key (Correct: {q.correct})
                </div>
                <div dangerouslySetInnerHTML={{ __html: q.solution }} />
              </div>
            )}
          </div>

          <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex gap-2">
              <button
                onClick={clearResponse}
                disabled={examSubmitted}
                className="bg-white border border-slate-300 text-slate-700 font-semibold px-3 py-1.5 rounded hover:bg-slate-100 cursor-pointer disabled:opacity-50"
              >
                Clear Response
              </button>
              <button
                onClick={toggleReview}
                className={`border font-semibold px-3 py-1.5 rounded transition cursor-pointer ${
                  markedForReview.has(q.id)
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'
                }`}
              >
                {markedForReview.has(q.id) ? 'Unmark Review' : 'Mark for Review'}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => jumpToQuestion(testQuestions[currentIndex - 1].id)}
                className="bg-slate-200 text-slate-700 font-semibold px-4 py-1.5 rounded disabled:opacity-50 cursor-pointer"
              >
                &larr; Previous
              </button>
              <button
                onClick={() => {
                  if (currentIndex < testQuestions.length - 1) {
                    jumpToQuestion(testQuestions[currentIndex + 1].id);
                  } else {
                    handleSubmitExam(true);
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded cursor-pointer"
              >
                {currentIndex === testQuestions.length - 1 ? 'Save & Review' : 'Save & Next →'}
              </button>
            </div>
          </div>
        </section>

        {/* Right Question Palette */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {answeredCount}
                </span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {testQuestions.length - answeredCount}
                </span>
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {markedForReview.size}
                </span>
                <span>Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                  {unvisitedCount}
                </span>
                <span>Not Visited</span>
              </div>
            </div>

            <div className="text-xs font-bold uppercase text-slate-600 flex justify-between mb-2">
              <span>{q.subject === 'Math' ? 'Mathematics' : q.subject}</span>
              <span>{testQuestions.filter((item) => item.subject === q.subject).length} Questions</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 max-h-96 overflow-y-auto p-1">
              {testQuestions
                .filter((item) => item.subject === q.subject)
                .map((item) => {
                  const isCurrent = item.id === q.id;
                  const isAns = userAnswers[item.id] !== undefined && userAnswers[item.id] !== '';
                  const isRev = markedForReview.has(item.id);
                  const isVis = visited.has(item.id);

                  let palCls = 'bg-slate-50 text-slate-700 border-slate-300';
                  if (examSubmitted) {
                    const isCor = String(userAnswers[item.id]).trim().toLowerCase() === String(item.correct).trim().toLowerCase();
                    if (isAns) palCls = isCor ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white';
                  } else {
                    if (isRev) palCls = 'bg-purple-600 text-white border-purple-600';
                    else if (isAns) palCls = 'bg-emerald-600 text-white border-emerald-600';
                    else if (isVis) palCls = 'bg-rose-500 text-white border-rose-500';
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => jumpToQuestion(item.id)}
                      className={`h-9 rounded text-xs font-mono font-bold border transition flex items-center justify-center cursor-pointer ${palCls} ${
                        isCurrent ? 'ring-2 ring-slate-900 scale-105' : ''
                      }`}
                    >
                      {item.id}
                    </button>
                  );
                })}
            </div>
          </div>
        </aside>
      </main>

      {/* Tab Switch Warning Modal */}
      {showCheatWarning && !examSubmitted && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-500 text-slate-800">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <ShieldAlert className="w-7 h-7 shrink-0" />
              <h3 className="text-lg font-bold">Tab Switch Detected!</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Switching tabs, windows, or opening external applications during the exam is strictly prohibited under exam conditions.
            </p>
            <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3 rounded-lg text-xs font-semibold mb-4">
              Warning {tabSwitchWarnings} of {maxAllowedSwitches}. If you switch tabs again, your examination will be <strong>automatically submitted</strong>.
            </div>
            <button
              onClick={() => setShowCheatWarning(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs transition cursor-pointer"
            >
              I Understand, Resume Test
            </button>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showModal && examResults && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-800">
            <h2 className="text-xl font-black text-center text-slate-900">Examination Results</h2>
            <p className="text-xs text-slate-500 text-center mt-1">
              JEE Main Practice Test ({testQuestions.length} Questions • {testQuestions.length * 4} Marks)
            </p>

            <div className="grid grid-cols-3 gap-3 my-5 text-center">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-indigo-600 block">TOTAL SCORE</span>
                <span className="text-2xl font-black text-slate-900 block my-1">
                  {examResults.totalScore}
                </span>
                <span className="text-[10px] text-slate-500">/ {testQuestions.length * 4}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-emerald-600 block">ACCURACY</span>
                <span className="text-2xl font-black text-slate-900 block my-1">
                  {examResults.accuracy}%
                </span>
                <span className="text-[10px] text-slate-500">
                  {examResults.totalCorrect} / {examResults.totalAttempted}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-slate-600 block">ATTEMPTED</span>
                <span className="text-2xl font-black text-slate-900 block my-1">
                  {examResults.totalAttempted}
                </span>
                <span className="text-[10px] text-slate-500">/ {testQuestions.length}</span>
              </div>
            </div>

            <table className="w-full border-collapse text-xs mb-5 text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-2">Subject</th>
                  <th className="p-2 text-center">Correct</th>
                  <th className="p-2 text-center">Wrong</th>
                  <th className="p-2 text-center">Unattempted</th>
                  <th className="p-2 text-right">Marks</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(examResults.subStats).map((k) => {
                  const st = examResults.subStats[k];
                  return (
                    <tr key={k} className="border-b border-slate-200">
                      <td className="p-2 font-bold">{k === 'Math' ? 'Mathematics' : k}</td>
                      <td className="p-2 text-center text-emerald-600 font-bold">{st.correct}</td>
                      <td className="p-2 text-center text-rose-600 font-bold">{st.wrong}</td>
                      <td className="p-2 text-center text-slate-400">{st.unattempted}</td>
                      <td className="p-2 text-right font-bold">{st.score}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-xs transition cursor-pointer"
              >
                Review Solutions
              </button>
              <button
                onClick={onExit}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded text-xs transition cursor-pointer"
              >
                Exit / Reconfigure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}