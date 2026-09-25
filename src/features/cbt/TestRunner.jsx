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
import { getStandardNEETQuestions } from '../../data/neetQuestionBank';
import { normalizeExam } from '../../config/examConfig';
import { supabase } from '../../services/supabaseClient';

export default function TestRunner({ test, currentUser, onComplete, onExit }) {
  // Guarantee questions exist: if test.questions is empty, generate them immediately
  const exam = normalizeExam(test?.exam || currentUser?.target_exam);
  const initialQuestions = useMemo(() => {
    let list = [];
    if (test && Array.isArray(test.questions) && test.questions.length > 0) {
      list = test.questions;
    } else {
      const sub = test?.subject || 'Physics';
      const ch = test?.chapter || 'All';
      const count = Number(test?.duration_minutes ? Math.min(25, Math.floor(test.duration_minutes / 2)) : 5) || 5;
      list = exam === 'NEET'
        ? getStandardNEETQuestions(sub === 'Full Syllabus' ? 'All' : sub, ch, count)
        : getStandardQuestions(sub === 'Full Syllabus' ? 'Physics' : sub, ch, count);
    }

    return list.map((q, idx) => {
      const base = {
        ...q,
        id: q.id || idx + 1,
        question: formatMathSymbols(q.question || q.question_text || q.text || `Question ${idx + 1}`),
        options: Array.isArray(q.options)
          ? q.options.map(opt => typeof opt === 'string' ? formatMathSymbols(opt) : opt?.text ? formatMathSymbols(opt.text) : String(opt))
          : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: q.correctAnswer !== undefined ? Number(q.correctAnswer) : q.correct_answer !== undefined ? Number(q.correct_answer) : 0,
        explanation: formatMathSymbols(q.explanation || q.solution || '')
      };
      const correctIndex = Number(base.correctAnswer);
      if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= base.options.length || base.options.length < 2) return base;
      const pairs = base.options.map((option, optionIndex) => ({ option, optionIndex }));
      for (let i = pairs.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
      }
      return {
        ...base,
        options: pairs.map((p) => p.option),
        correctAnswer: pairs.findIndex((p) => p.optionIndex === correctIndex)
      };
    });
  }, [test, exam]);

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

  // Derive subject sections from the actual question metadata. This keeps
  // the visible subject tabs aligned with the questions loaded for each section.
  const subjectSections = useMemo(() => {
    if (test?.subject !== 'All' && test?.subject !== 'Full Syllabus') return [];
    const names = exam === 'NEET' ? ['Physics', 'Chemistry', 'Biology'] : ['Physics', 'Chemistry', 'Mathematics'];
    const sections = [];
    let lastSubject = null;
    questions.forEach((question, index) => {
      const subject = names.includes(question?.subject) ? question.subject : null;
      if (subject && subject !== lastSubject) {
        sections.push({ subject, firstIndex: index });
        lastSubject = subject;
      }
    });
    // Backward-compatible fallback for any legacy questions without subject metadata.
    if (sections.length < 2) {
      const perSection = Math.ceil(questions.length / names.length);
      return names.map((subject, i) => ({
        subject,
        firstIndex: Math.min(i * perSection, Math.max(0, questions.length - 1))
      })).filter((section, i) => i === 0 || section.firstIndex > 0);
    }
    return sections;
  }, [questions, test?.subject, exam]);

  const activeSubject = subjectSections.find((section, i) => {
    const next = subjectSections[i + 1];
    return currentIdx >= section.firstIndex && (!next || currentIdx < next.firstIndex);
  })?.subject;

  const jumpToSubject = (subject) => {
    const section = subjectSections.find((item) => item.subject === subject);
    if (section) setCurrentIdx(section.firstIndex);
  };

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
    <div className="cbt-runner w-full max-w-7xl mx-auto py-3 px-4 flex flex-col gap-3">
      {/* Top Status Bar */}
      <div className="cbt-status-bar shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-lg">
        <div className="cbt-status-left flex items-center gap-3 min-w-0">
          <div className="cbt-logo-wrap shrink-0" aria-label="PrepXAI">
            <img src="/icon-192.png" alt="PrepXAI logo" className="cbt-logo" />
          </div>
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
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-sm font-bold text-white truncate">{test?.title || 'JEE CBT Examination'}</h2>
              <span className="cbt-brand-name hidden sm:inline text-[10px] font-black tracking-wide text-slate-300">PrepXAI</span>
            </div>
            <span className="text-[10px] text-indigo-400 font-semibold truncate block">{test?.subject || 'Practice'} • {test?.chapter || 'All'}</span>
          </div>
        </div>

        <div className="cbt-status-actions flex items-center gap-3 shrink-0">
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
            <Send className="w-3.5 h-3.5" /><span className="cbt-submit-label">Submit Exam</span>
          </button>
        </div>
      </div>

      {subjectSections.length > 1 && (
        <div className="cbt-subject-bar shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-lg">
          <div className="flex items-center gap-2 overflow-x-auto">
            {subjectSections.map((section) => (
              <button
                key={section.subject}
                type="button"
                onClick={() => jumpToSubject(section.subject)}
                className={`flex-1 min-w-[130px] px-4 py-2.5 rounded-xl border text-xs font-bold transition ${activeSubject === section.subject ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}
              >
                {section.subject}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Question Panel & Palette */}
      <div className="cbt-main-grid flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Left: Question Content */}
        <div className="cbt-question-panel lg:col-span-3 min-h-0 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                Q {currentIdx + 1} / {questions.length}
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
          <div className="cbt-action-bar flex items-center justify-between border-t border-slate-800 pt-4 mt-6">
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
        <div className="cbt-palette lg:col-span-1 min-h-0 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Question Palette</h3>
          
          <div className="grid grid-cols-5 gap-2 flex-1 min-h-0 overflow-y-auto pr-1">
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