import { useEffect, useMemo, useState } from 'react';
import { Clock, ChevronLeft, ChevronRight, Flag, X } from 'lucide-react';

export default function PYQSession({ session, currentUser, onExit }) {
  const questions = useMemo(() => (Array.isArray(session?.questions) ? session.questions : []).map((q, idx) => ({
    ...q,
    id: q.id ?? idx + 1,
    question: q.question || q.question_text || q.text || `Question ${idx + 1}`,
    options: Array.isArray(q.options) ? q.options : []
  })), [session]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [feedback, setFeedback] = useState({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showExitWarning, setShowExitWarning] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const currentQ = questions[currentIdx];

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const selectOption = (index) => {
    if (answers[currentIdx] !== undefined) return;
    const correctIndex = Number(currentQ?.correctAnswer ?? currentQ?.correct_answer);
    const isCorrect = Number.isFinite(correctIndex) && index === correctIndex;
    setAnswers((prev) => ({ ...prev, [currentIdx]: index }));
    setFeedback((prev) => ({ ...prev, [currentIdx]: { isCorrect, correctIndex } }));
  };

  const toggleMark = () => {
    setMarkedForReview((prev) => ({ ...prev, [currentIdx]: !prev[currentIdx] }));
  };

  const requestExit = () => setShowExitWarning(true);

  const confirmExit = () => {
    setShowExitWarning(false);
    onExit?.();
  };

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-400 mb-4">No questions are available for this session.</p>
          <button onClick={onExit} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold">Back to PYQS</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pyq-session h-screen max-h-screen overflow-hidden bg-slate-950 text-slate-100 p-3 sm:p-4">
      <div className="h-full max-w-7xl mx-auto flex flex-col gap-3">
        <div className="shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={requestExit} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white shrink-0" title="End session">
              <X className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-white truncate">{session.title || `${session.exam} PYQS Session`}</h1>
              <p className="text-[10px] text-slate-500">{session.exam} • {session.subject || 'All Subjects'} • Practice Session</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 shrink-0">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-sm font-bold tracking-wider text-white">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        <div className="pyq-main-grid flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="pyq-question-panel lg:col-span-3 min-h-0 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className="text-[11px] text-slate-500">
                  {currentQ?.yearTag || currentQ?.year_tag || 'PYQ'}
                </span>
              </div>

              <div className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed whitespace-pre-wrap mb-7">
                {currentQ?.question}
              </div>

              <div className="flex flex-col gap-3">
                {currentQ?.options?.map((opt, idx) => {
                  const selected = answers[currentIdx] === idx;
                  const result = feedback[currentIdx];
                  const isCorrect = result?.correctIndex === idx;
                  const isWrong = selected && result && !result.isCorrect;
                  const optionState = result
                    ? isCorrect
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-100'
                      : isWrong
                        ? 'bg-rose-600/20 border-rose-500 text-rose-100'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    : selected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700';
                  return (
                    <button key={idx} onClick={() => selectOption(idx)} disabled={answers[currentIdx] !== undefined}
                      className={`p-4 rounded-xl border text-sm text-left flex items-center gap-3 transition ${optionState}`}>
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${result && isCorrect ? 'bg-emerald-600 border-emerald-500 text-white' : result && isWrong ? 'bg-rose-600 border-rose-500 text-white' : selected ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
              {feedback[currentIdx] && (
                <div className={`mt-4 rounded-xl border p-4 ${feedback[currentIdx].isCorrect ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10'}`}>
                  <p className="text-sm font-bold text-white">
                    {feedback[currentIdx].isCorrect ? 'Correct answer' : 'Incorrect answer'}
                  </p>
                  {!feedback[currentIdx].isCorrect && feedback[currentIdx].correctIndex >= 0 && (
                    <p className="text-xs text-slate-300 mt-1">
                      Correct option: {String.fromCharCode(65 + feedback[currentIdx].correctIndex)}
                    </p>
                  )}
                  {currentQ?.explanation && (
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{currentQ.explanation}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4 mt-8">
              <button onClick={toggleMark}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${markedForReview[currentIdx] ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}>
                <Flag className="w-3.5 h-3.5" />
                {markedForReview[currentIdx] ? 'Marked for Review' : 'Mark for Review'}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button disabled={currentIdx === 0} onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-semibold flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button disabled={currentIdx === questions.length - 1} onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 rounded-xl text-xs font-semibold flex items-center gap-1">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-0 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3 overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Question Navigation</h2>
              <span className="text-[10px] text-slate-500">{Object.keys(answers).length} attempted</span>
            </div>

            <div className="pyq-question-navigation grid grid-cols-5 gap-2 flex-1 min-h-0 overflow-y-auto pr-1">
              {questions.map((_, idx) => {
                const answered = answers[idx] !== undefined;
                const marked = markedForReview[idx];
                const current = idx === currentIdx;
                const style = marked
                  ? 'bg-purple-600 text-white border-purple-500'
                  : answered
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : current
                      ? 'bg-indigo-600 text-white border-indigo-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600';

                return (
                  <button key={idx} onClick={() => setCurrentIdx(idx)}
                    className={`h-9 rounded-lg border text-xs font-bold flex items-center justify-center transition ${style} ${current ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900' : ''}`}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-800 pt-3 flex flex-col gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-600" /> Attempted</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-purple-600" /> Marked for review</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-950 border border-slate-800" /> Not attempted</div>
            </div>

            <button onClick={requestExit} className="mt-auto w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-600/20 border border-slate-700 hover:border-rose-500/40 text-xs font-bold text-slate-300 hover:text-rose-300 transition">
              End Session
            </button>
          </div>
        </div>
      </div>

      {showExitWarning && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white">End PYQS session?</h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Your stopwatch will stop and you will leave this practice session. Do you want to end the session?
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowExitWarning(false)} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700">
                Continue Session
              </button>
              <button onClick={confirmExit} className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500">
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
