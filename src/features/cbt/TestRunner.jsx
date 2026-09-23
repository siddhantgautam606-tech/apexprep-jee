import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  BookOpen, 
  X 
} from 'lucide-react';
import { computeExamStats } from '../../services/testEngineService';
import { saveTestAttempt } from '../../services/analyticsService';
import { getStandardQuestions, formatMathSymbols } from '../../data/jeeQuestionBank';
import { supabase } from '../../services/supabaseClient';

export default function TestRunner({ test, currentUser, onComplete, onExit }) {
  // Guarantee questions exist: if test.questions is empty, generate them immediately
  const initialQuestions = useMemo(() => {
    let list = [];
    if (test && Array.isArray(test.questions) && test.questions.length > 0) {
      list = test.questions;
    } else {
      const sub = test?.subject || 'Physics';
      const ch = test?.chapter || 'All';
      const count = Number(test?.duration_minutes ? Math.min(25, Math.floor(test.duration_minutes / 2)) : 5) || 5;
      list = getStandardQuestions(sub === 'Full Syllabus' ? 'Physics' : sub, ch, count);
    }

    return list.map((q, idx) => ({
      ...q,
      id: q.id || idx + 1,
      question: formatMathSymbols(q.question || q.question_text || q.text || `Question ${idx + 1}`),
      options: Array.isArray(q.options) 
        ? q.options.map(opt => typeof opt === 'string' ? formatMathSymbols(opt) : opt?.text ? formatMathSymbols(opt.text) : String(opt))
        : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: q.correctAnswer !== undefined ? Number(q.correctAnswer) : q.correct_answer !== undefined ? Number(q.correct_answer) : 0,
      explanation: formatMathSymbols(q.explanation || q.solution || '')
    }));
  }, [test]);

  const [questions] = useState(initialQuestions);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeRemaining, setTimeRemaining] = useState((test?.durationMinutes || test?.duration_minutes || 60) * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examResult, setExamResult] = useState(null);

  // Timer Countdown
  useEffect(() => {
    if (isSubmitted || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeRemaining]);

  const currentQ = questions[currentIdx];

  const handleSelectOption = (optIdx) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIdx
    }));
  };

  const handleClearResponse = () => {
    if (isSubmitted) return;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentIdx];
      return copy;
    });
  };

  const handleToggleMarkReview = () => {
    if (isSubmitted) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [currentIdx]: !prev[currentIdx]
    }));
  };

  const handleSubmitExam = async () => {
    if (isSubmitted) return;
    const totalTimeTaken = ((test?.durationMinutes || test?.duration_minutes || 60) * 60) - timeRemaining;
    const stats = computeExamStats(questions, answers, totalTimeTaken);
    setExamResult(stats);
    setIsSubmitted(true);

    if (currentUser?.id) { saveTestAttempt({ userId: currentUser.id, testQuestions: questions, userAnswers: answers, examResults: stats, durationMinutes: Math.max(0, Math.round(totalTimeTaken / 60)) }); }

    // If this test belongs to a study circle, save submission to Supabase
    if (test?.circleId || test?.circle_id) {
      const circleId = test.circleId || test.circle_id;
      if (currentUser?.id) {
        try {
          const { error: submissionError } = await supabase.from('circle_test_submissions').insert([
            {
              circle_id: circleId,
              test_id: test.id,
              user_id: currentUser.id,
              score: stats.score,
              accuracy_pct: stats.accuracy,
              answers: answers
            }
          ]);
          if (submissionError) throw submissionError;
        } catch (e) {
          console.warn('Could not save circle test score:', e);
        }
      }
    }
  };

  // Format seconds to HH:MM:SS
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? `${h}:` : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // View Results Screen
  if (isSubmitted && examResult) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Test Completed!</h2>
              <p className="text-xs text-slate-400 mt-1">{test?.title || 'Practice Examination'}</p>
            </div>
            <button
              onClick={onComplete || onExit}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
            >
              Exit to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-center">
              <span className="text-xs text-slate-400">Total Score</span>
              <p className="text-2xl font-black text-indigo-400 mt-1">{examResult.score} / {examResult.maxScore}</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-center">
              <span className="text-xs text-slate-400">Accuracy</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{examResult.accuracy}%</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-center">
              <span className="text-xs text-slate-400">Correct Answers</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{examResult.correct}</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-center">
              <span className="text-xs text-slate-400">Incorrect Answers</span>
              <p className="text-2xl font-black text-rose-400 mt-1">{examResult.incorrect}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Question Review & Solutions</h3>
            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
              {questions.map((q, idx) => {
                const userAns = answers[idx];
                const isCorrect = userAns !== undefined && Number(userAns) === Number(q.correctAnswer);
                const isUnanswered = userAns === undefined;

                return (
                  <div key={idx} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-400">Q{idx + 1}</span>
                      <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        isCorrect ? 'bg-emerald-500/10 text-emerald-400' : isUnanswered ? 'bg-slate-800 text-slate-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {isCorrect ? 'Correct (+4)' : isUnanswered ? 'Unattempted (0)' : 'Incorrect (-1)'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200">{q.question}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = userAns === oIdx;
                        const isRightOpt = Number(q.correctAnswer) === oIdx;
                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                              isRightOpt 
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold' 
                                : isChosen 
                                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' 
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-slate-800">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-1 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active CBT Exam Runner
  return (
    <div className="max-w-7xl mx-auto py-4 px-4 flex flex-col gap-4">
      {/* Top Status Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to exit the exam? Your progress will be lost.')) {
                onExit();
              }
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition"
            title="Exit Exam"
          >
            <X className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white">{test?.title || 'JEE CBT Examination'}</h2>
            <span className="text-[10px] text-indigo-400 font-semibold">{test?.subject || 'Practice'} • {test?.chapter || 'All'}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-xs font-bold text-white tracking-wider">
              {formatTime(timeRemaining)}
            </span>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Are you ready to submit your test?')) {
                handleSubmitExam();
              }
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Send className="w-3.5 h-3.5" /> Submit Exam
          </button>
        </div>
      </div>

      {/* Main Grid: Question Panel & Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Question Content */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[520px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Marking: <strong className="text-emerald-400">+4</strong> / <strong className="text-rose-400">-1</strong></span>
              </div>
            </div>

            <div className="text-sm font-medium text-slate-100 leading-relaxed whitespace-pre-wrap mb-6">
              {currentQ?.question}
            </div>

            {/* Options List */}
            <div className="flex flex-col gap-3">
              {currentQ?.options?.map((opt, optIdx) => {
                const isSelected = answers[currentIdx] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-3.5 rounded-xl border text-xs text-left flex items-center gap-3 transition ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 border ${
                      isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-6">
            <button
              onClick={handleToggleMarkReview}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                markedForReview[currentIdx]
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {markedForReview[currentIdx] ? 'Marked for Review' : 'Mark for Review'}
            </button>

            <button
              onClick={handleClearResponse}
              className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 transition"
            >
              Clear Response
            </button>

            <div className="flex items-center gap-2">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-semibold text-white transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                disabled={currentIdx === questions.length - 1}
                onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 rounded-xl text-xs font-semibold text-white transition flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Question Palette */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Question Palette</h3>
          
          <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
            {questions.map((_, idx) => {
              const isAnswered = answers[idx] !== undefined;
              const isMarked = markedForReview[idx];
              const isCurrent = currentIdx === idx;

              let style = 'bg-slate-950 border-slate-800 text-slate-400';
              if (isMarked) {
                style = 'bg-purple-600 text-white border-purple-500';
              } else if (isAnswered) {
                style = 'bg-emerald-600 text-white border-emerald-500';
              } else if (isCurrent) {
                style = 'bg-indigo-600 text-white border-indigo-400';
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-9 rounded-lg border text-xs font-bold transition flex items-center justify-center ${style} ${
                    isCurrent ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-800 pt-3 flex flex-col gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-600 shrink-0" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-purple-600 shrink-0" />
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-950 border border-slate-800 shrink-0" />
              <span>Unattempted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}