import { useState, useEffect, useRef, useMemo } from 'react';
import { computeExamStats } from '../../services/testEngineService';
import { saveTestAttempt } from '../../services/analyticsService';
import { ShieldAlert } from 'lucide-react';

export default function TestRunner({ testQuestions = [], durationMinutes = 180, onExit }) {
  // Normalize question items so that all standard JEE question bank shapes work seamlessly
  const normalizedQuestions = useMemo(() => {
    if (!Array.isArray(testQuestions)) return [];
    return testQuestions.map((rawQ, index) => {
      const q = rawQ?.data || rawQ?.payload || rawQ || {};
      const id = q.id !== undefined && q.id !== null ? q.id : index + 1;

      // Question body / prompt
      const text =
        q.text ||
        q.question ||
        q.question_text ||
        q.questionText ||
        q.statement ||
        q.problem ||
        q.prompt ||
        q.body ||
        '';

      // Options parsing
      let options = [];
      const rawOpts = q.options || q.choices || q.answers || [];

      if (Array.isArray(rawOpts)) {
        options = rawOpts.map((opt, optIdx) => {
          const defaultKey = String.fromCharCode(65 + optIdx);
          if (typeof opt === 'string' || typeof opt === 'number') {
            return { key: defaultKey, text: String(opt) };
          }
          if (opt && typeof opt === 'object') {
            return {
              key: opt.key || opt.label || defaultKey,
              text: opt.text || opt.option || opt.label || opt.value || JSON.stringify(opt)
            };
          }
          return { key: defaultKey, text: String(opt) };
        });
      } else if (rawOpts && typeof rawOpts === 'object') {
        options = Object.entries(rawOpts).map(([key, val]) => ({
          key: String(key).toUpperCase(),
          text: typeof val === 'object' ? (val.text || val.value || JSON.stringify(val)) : String(val)
        }));
      }

      // Answer key — resolve to the *option key* (e.g. "A"/"B"/"C"/"D") regardless of
      // whether the source data expresses the correct answer as a numeric index (0-3,
      // as QUESTIONS_POOL's correctIndex does) or already as a letter. Answers are
      // always stored (see selectOption below) as the option's letter key, so the
      // correct-answer representation here must match that or nothing can ever score
      // as correct.
      const rawCorrect =
        q.correct !== undefined
          ? q.correct
          : q.correctAnswer !== undefined
          ? q.correctAnswer
          : q.correct_answer !== undefined
          ? q.correct_answer
          : q.answer;

      let correct = '';
      if (rawCorrect !== undefined && rawCorrect !== null && rawCorrect !== '') {
        const asString = String(rawCorrect).trim();
        if (/^\d+$/.test(asString)) {
          correct = options[Number(asString)]?.key || asString;
        } else {
          correct = asString.toUpperCase();
        }
      }

      const subject = q.subject || 'Physics';
      const section = q.section || (options.length > 0 ? 'Section A' : 'Section B');
      const type = q.type || (options.length > 0 ? 'MCQ' : 'Numerical');
      const solution = q.solution || q.explanation || 'No solution provided.';

      return {
        ...q,
        id,
        index,
        text,
        options,
        correct,
        subject,
        section,
        type,
        solution,
        meta: q.chapter || q.topic || q.meta || 'General'
      };
    });
  }, [testQuestions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [visited, setVisited] = useState(() =>
    normalizedQuestions.length > 0 ? new Set([normalizedQuestions[0].id]) : new Set()
  );
  const [timeLeft, setTimeLeft] = useState((durationMinutes || 180) * 60);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [examResults, setExamResults] = useState(null);

  // Anti-cheat state
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);
  const maxAllowedSwitches = 2;

  const currentQ = normalizedQuestions[currentIndex] || null;

  const examSubmittedRef = useRef(examSubmitted);
  useEffect(() => {
    examSubmittedRef.current = examSubmitted;
  }, [examSubmitted]);

  const handleSubmitExam = (confirmPrompt = true) => {
    if (confirmPrompt) {
      const answeredCount = Object.keys(userAnswers).length;
      if (
        !window.confirm(
          `You have answered ${answeredCount} of ${normalizedQuestions.length} questions.\n\nAre you sure you want to submit your exam?`
        )
      ) {
        return;
      }
    }
    const res = computeExamStats(normalizedQuestions, userAnswers);
    setExamResults(res);
    setExamSubmitted(true);
    setShowModal(true);

    saveTestAttempt({
      testQuestions: normalizedQuestions,
      userAnswers,
      examResults: res,
      durationMinutes
    });
  };

  // Countdown timer — the interval only ever decrements state here.
  useEffect(() => {
    if (examSubmitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [examSubmitted, timeLeft]);

  // Auto-submit once time runs out. Kept as its own effect (rather than a side
  // effect inside the setTimeLeft updater above) so it can't fire twice under
  // React StrictMode's double-invocation of state updater functions, which
  // was previously duplicating saved test attempts.
  useEffect(() => {
    if (!examSubmitted && timeLeft === 0) {
      handleSubmitExam(false);
    }
  }, [timeLeft, examSubmitted]);

  // Tab switch detection
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
    if (examSubmitted || !currentQ) return;
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: key }));
  };

  const saveNumericalAnswer = (val) => {
    if (examSubmitted || !currentQ) return;
    setUserAnswers((prev) => {
      const updated = { ...prev };
      if (!val || val.trim() === '') delete updated[currentQ.id];
      else updated[currentQ.id] = val.trim();
      return updated;
    });
  };

  const clearResponse = () => {
    if (examSubmitted || !currentQ) return;
    setUserAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentQ.id];
      return updated;
    });
  };

  const toggleReview = () => {
    if (!currentQ) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) next.delete(currentQ.id);
      else next.add(currentQ.id);
      return next;
    });
  };

  const jumpToQuestion = (id) => {
    const idx = normalizedQuestions.findIndex((item) => item.id === id);
    if (idx !== -1) {
      setCurrentIndex(idx);
      markVisited(id);
    }
  };

  const switchSubject = (subj) => {
    const target = normalizedQuestions.find((item) =>
      String(item.subject).toLowerCase().startsWith(subj.toLowerCase().slice(0, 4))
    );
    if (target) {
      jumpToQuestion(target.id);
    }
  };

  if (!normalizedQuestions.length || !currentQ) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <p className="text-slate-300 mb-4">No questions loaded for this test configuration.</p>
        <button
          onClick={onExit}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded text-xs"
        >
          Return to Config
        </button>
      </div>
    );
  }

  const answeredCount = Object.keys(userAnswers).length;
  const unvisitedCount = Math.max(0, normalizedQuestions.length - visited.size);
  const curAnswer = userAnswers[currentQ.id];

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
                Physics • Chemistry • Mathematics • {normalizedQuestions.length} Questions • {normalizedQuestions.length * 4} Marks
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
              const isActive = String(currentQ.subject).toLowerCase().startsWith(s.toLowerCase().slice(0, 4));
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
                Q. {currentQ.id}
              </span>
              <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase">
                {currentQ.section}
              </span>
              <span className="text-slate-500 font-semibold">{currentQ.meta}</span>
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
            {/* Question Prompt */}
            <div
              className="text-base font-medium text-slate-900 leading-relaxed mb-4 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: currentQ.text || 'No question text provided.' }}
            />

            {currentQ.graphicSvg && (
              <div
                className="flex justify-center my-3"
                dangerouslySetInnerHTML={{ __html: currentQ.graphicSvg }}
              />
            )}

            {currentQ.type === 'MCQ' || currentQ.options.length > 0 ? (
              <div className="flex flex-col gap-2.5 my-2">
                {currentQ.options.map((opt, optIdx) => {
                  const optKey = opt.key || String.fromCharCode(65 + optIdx);
                  const isChecked = String(curAnswer).toUpperCase() === String(optKey).toUpperCase();
                  const isCorrectKey =
                    String(currentQ.correct).toUpperCase() === String(optKey).toUpperCase() ||
                    String(currentQ.correct) === String(optIdx);

                  let itemStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';

                  if (examSubmitted) {
                    if (isCorrectKey) itemStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                    else if (isChecked && !isCorrectKey) itemStyle = 'bg-rose-50 border-rose-500 text-rose-900 line-through';
                  } else if (isChecked) {
                    itemStyle = 'bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold';
                  }

                  return (
                    <label
                      key={optKey}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-sm transition ${itemStyle}`}
                    >
                      <input
                        type="radio"
                        name={`q_${currentQ.id}`}
                        value={optKey}
                        checked={isChecked}
                        disabled={examSubmitted}
                        onChange={() => selectOption(optKey)}
                        className="hidden"
                      />
                      <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                        ({String(optKey).toLowerCase()})
                      </span>
                      <span className="flex-1" dangerouslySetInnerHTML={{ __html: opt.text }} />
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
                      Key: {currentQ.correct}
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
                  • Solution & Key (Correct: {currentQ.correct || 'N/A'})
                </div>
                <div dangerouslySetInnerHTML={{ __html: currentQ.solution }} />
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
                  markedForReview.has(currentQ.id)
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'
                }`}
              >
                {markedForReview.has(currentQ.id) ? 'Unmark Review' : 'Mark for Review'}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => jumpToQuestion(normalizedQuestions[currentIndex - 1].id)}
                className="bg-slate-200 text-slate-700 font-semibold px-4 py-1.5 rounded disabled:opacity-50 cursor-pointer"
              >
                &larr; Previous
              </button>
              <button
                onClick={() => {
                  if (currentIndex < normalizedQuestions.length - 1) {
                    jumpToQuestion(normalizedQuestions[currentIndex + 1].id);
                  } else {
                    handleSubmitExam(true);
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded cursor-pointer"
              >
                {currentIndex === normalizedQuestions.length - 1 ? 'Save & Review' : 'Save & Next →'}
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
                  {normalizedQuestions.length - answeredCount}
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
              <span>{currentQ.subject === 'Math' ? 'Mathematics' : currentQ.subject}</span>
              <span>
                {
                  normalizedQuestions.filter((item) =>
                    String(item.subject).toLowerCase().startsWith(String(currentQ.subject).toLowerCase().slice(0, 4))
                  ).length
                }{' '}
                Questions
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 max-h-96 overflow-y-auto p-1">
              {normalizedQuestions
                .filter((item) =>
                  String(item.subject).toLowerCase().startsWith(String(currentQ.subject).toLowerCase().slice(0, 4))
                )
                .map((item) => {
                  const isCurrent = item.id === currentQ.id;
                  const isAns = userAnswers[item.id] !== undefined && userAnswers[item.id] !== '';
                  const isRev = markedForReview.has(item.id);
                  const isVis = visited.has(item.id);

                  let palCls = 'bg-slate-50 text-slate-700 border-slate-300';
                  if (examSubmitted) {
                    const isCor = String(userAnswers[item.id]).trim().toUpperCase() === String(item.correct).trim().toUpperCase();
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
              JEE Main Practice Test ({normalizedQuestions.length} Questions • {normalizedQuestions.length * 4} Marks)
            </p>

            <div className="grid grid-cols-3 gap-3 my-5 text-center">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-indigo-600 block">TOTAL SCORE</span>
                <span className="text-2xl font-black text-slate-900 block my-1">
                  {examResults.totalScore ?? 0}
                </span>
                <span className="text-[10px] text-slate-500">/ {normalizedQuestions.length * 4}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-emerald-600 block">ACCURACY</span>
                <span className="text-2xl font-black text-slate-900 block my-1">
                  {examResults.accuracy ?? 0}%
                </span>
                <span className="text-[10px] text-slate-500">
                  {examResults.totalCorrect ?? 0} / {examResults.totalAttempted ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-slate-600 block">ATTEMPTED</span>
                <span className="text-2xl font-black text-slate-900 block my-1">
                  {examResults.totalAttempted ?? 0}
                </span>
                <span className="text-[10px] text-slate-500">/ {normalizedQuestions.length}</span>
              </div>
            </div>

            {examResults.subStats && (
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
            )}

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