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

    return list
      .filter((q) => exam !== 'NEET' || !['NUM', 'INTEGER', 'NUMERICAL', 'NAT'].includes(String(q?.type || q?.question_type || '').toUpperCase()))
      .map((q, idx) => {
      const base = {
        ...q,
        type: String(q.type || q.question_type || 'MCQ').toUpperCase(),
        id: q.id || idx + 1,
        question: formatMathSymbols(q.question || q.question_text || q.text || `Question ${idx + 1}`),
        options: Array.isArray(q.options)
          ? q.options.map(opt => typeof opt === 'string' ? formatMathSymbols(opt) : opt?.text ? formatMathSymbols(opt.text) : String(opt))
          : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: q.correctAnswer !== undefined ? Number(q.correctAnswer) : q.correct_answer !== undefined ? Number(q.correct_answer) : 0,
        explanation: formatMathSymbols(q.explanation || q.solution || '')
      };
      if (['NUM', 'INTEGER', 'NUMERICAL', 'NAT'].includes(base.type)) return base;
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
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);

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
    if (isSubmitted || ['NUM', 'INTEGER', 'NUMERICAL', 'NAT'].includes(currentQ?.type)) return;
    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIdx
    }));
  };

  const handleNumericAnswer = (value) => {
    if (isSubmitted || !currentQ) return;
    const cleaned = String(value ?? '').replace(/[^0-9-]/g, '');
    setAnswers((prev) => {
      const copy = { ...prev };
      if (!cleaned.trim()) delete copy[currentIdx];
      else copy[currentIdx] = cleaned.trim();
      return copy;
    });
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
    setResultModalOpen(true);

    if (currentUser?.id) { await saveTestAttempt({ userId: currentUser.id, testQuestions: questions, userAnswers: answers, examResults: stats, durationMinutes: Math.max(0, Math.round(totalTimeTaken / 60)) }); }

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
      <div className="cbt-results max-w-4xl mx-auto py-8 px-4">
        <div className="cbt-results-card bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
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
    <div className="cbt-runner">
      <header className="exam-header">
        <div className="header-top">
          <div className="brand-box">
            <div className="brand-logo">NTA</div>
            <div>
              <div className="brand-title">{test?.title || (exam === 'NEET' ? 'NEET Mock Examination' : 'JEE (Main) Mock Examination')}</div>
              <div className="brand-sub">{exam === 'NEET' ? 'Physics • Chemistry • Biology' : 'Physics • Chemistry • Mathematics'} • {questions.length} Questions</div>
            </div>
          </div>
          <div className="header-controls">
            <div className="timer-container">
              <span className="timer-label">Time Remaining</span>
              <span className="timer-val">{formatTime(timeRemaining)}</span>
            </div>
            <button className="submit-btn" onClick={() => { if (window.confirm('Are you ready to submit your test?')) handleSubmitExam(); }}>Submit Exam</button>
          </div>
        </div>

        {subjectSections.length > 1 && (
          <div className="tabs-bar">
            <div className="tabs-container">
              {subjectSections.map((section, i) => {
                const next = subjectSections[i + 1];
                const end = next ? next.firstIndex : questions.length;
                const part = ['Physics','Chemistry','Mathematics','Biology'].indexOf(section.subject) + 1;
                return (
                  <button key={section.subject} onClick={() => jumpToSubject(section.subject)} className={`tab-btn ${activeSubject === section.subject ? 'active' : ''}`}>
                    Part {part}: {section.subject} (Q{section.firstIndex + 1}–{end})
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <main className="exam-main">
        <section className="panel-card question-panel">
          <div className="panel-meta">
            <div className="meta-left">
              <span className="badge-q">Q. {currentIdx + 1}</span>
              <span className="badge-sec">{['NUM','INTEGER','NUMERICAL','NAT'].includes(currentQ?.type) ? 'Section B' : 'Section A'}</span>
              <span className="meta-info">{currentQ?.meta || ''}</span>
            </div>
            <div className="meta-marks">
              <span className="mark-pos">+4 Correct</span>
              <span className="mark-neg">-1 Wrong</span>
            </div>
          </div>

          <div className="q-body">
            <div className="q-text" dangerouslySetInnerHTML={{__html: currentQ?.question || 'Loading question content...'}} />
            {currentQ?.graphicSvg && <div className="q-graphic" dangerouslySetInnerHTML={{__html: currentQ.graphicSvg}} />}
            
            {['NUM','INTEGER','NUMERICAL','NAT'].includes(currentQ?.type) ? (
              <div className="num-box">
                <div className="num-input-wrap">
                  <input
                    className="num-input"
                    type="text"
                    inputMode="numeric"
                    value={answers[currentIdx] ?? ''}
                    disabled={isSubmitted}
                    onChange={(e) => handleNumericAnswer(e.target.value)}
                    aria-label="Integer answer"
                  />
                </div>
              </div>
            ) : (
              <div className="options-group">
                {currentQ?.options?.map((opt, optIdx) => {
                  const selected = answers[currentIdx] === optIdx;
                  return (
                    <button key={optIdx} className={`option-item ${selected ? 'selected' : ''}`} onClick={() => handleSelectOption(optIdx)}>
                      <span className="opt-circle">{String.fromCharCode(65 + optIdx)}</span>
                      <span dangerouslySetInnerHTML={{__html: String(opt)}} />
                    </button>
                  );
                })}
              </div>
            )}
            {showSolutions && currentQ?.explanation && (
              <div className="sol-card">
                <div className="sol-header">• Solution & Key</div>
                <div dangerouslySetInnerHTML={{__html: currentQ.explanation}} />
              </div>
            )}
          </div>

          <div className="panel-footer">
            <div className="footer-left">
              <button className="btn-secondary" onClick={handleClearResponse}>Clear Response</button>
              <button className={`btn-review ${markedForReview[currentIdx] ? 'active' : ''}`} onClick={handleToggleMarkReview}>
                {markedForReview[currentIdx] ? 'Marked for Review' : 'Mark for Review'}
              </button>
            </div>
            <div className="footer-right">
              <button className="btn-nav-prev" disabled={currentIdx === 0} onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}>← Previous</button>
              <button className="btn-nav-next" disabled={currentIdx === questions.length - 1} onClick={() => setCurrentIdx((p) => Math.min(questions.length - 1, p + 1))}>Save & Next →</button>
            </div>
          </div>
        </section>

        <aside className="palette-aside">
          <div className="palette-box">
            <div className="palette-legend">
              <div className="legend-item"><span className="legend-pill answered">{Object.keys(answers).length}</span> Answered</div>
              <div className="legend-item"><span className="legend-pill not-answered">{questions.length - Object.keys(answers).length}</span> Not Answered</div>
              <div className="legend-item"><span className="legend-pill review-count">{Object.values(markedForReview).filter(Boolean).length}</span> Review</div>
              <div className="legend-item"><span className="legend-pill not-visited">0</span> Not Visited</div>
            </div>
            <div className="palette-subject">
              <span>{activeSubject || currentQ?.subject || 'Questions'}</span>
              <span>{questions.length} Questions</span>
            </div>
            <div className="palette-grid">
              {questions.map((_, idx) => {
                const isAnswered = answers[idx] !== undefined;
                const isMarked = markedForReview[idx];
                const isCurrent = currentIdx === idx;
                return (
                  <button key={idx} onClick={() => setCurrentIdx(idx)} className={`pal-btn ${isMarked ? 'rev' : isAnswered ? 'ans' : ''} ${isCurrent ? 'current' : ''}`}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </main>

      <div className={`modal-overlay ${resultModalOpen && examResult ? 'open' : ''}`}>
        {examResult && (
          <div className="modal-card">
            <h2 className="modal-title">Examination Results</h2>
            <p className="modal-subtitle">{exam === 'NEET' ? 'NEET Practice Test' : 'JEE Main Practice Test'} – {questions.length} Questions</p>
            <div className="summary-grid">
              <div className="score-tile"><span className="score-label">TOTAL SCORE</span><span className="score-big">{examResult.score}</span><span className="score-sub">/ {examResult.maxScore}</span></div>
              <div className="score-tile"><span className="score-label accuracy">ACCURACY</span><span className="score-big">{examResult.accuracy}%</span><span className="score-sub">{examResult.correct} / {examResult.attempted}</span></div>
              <div className="score-tile"><span className="score-label">ATTEMPTED</span><span className="score-big">{examResult.attempted}</span><span className="score-sub">/ {questions.length}</span></div>
            </div>
            <table className="sub-table">
              <thead><tr><th>Subject</th><th>Correct</th><th>Wrong</th><th>Unattempted</th><th>Marks</th></tr></thead>
              <tbody>
                {Object.entries(questions.reduce((acc,q,i)=>{
                  const subject=q.subject||'General'; const a=acc[subject]||(acc[subject]={correct:0,wrong:0,unattempted:0,marks:0});
                  const u=answers[i]; if(u===undefined){a.unattempted++;} else {
                    const correct=String(u)===String(q.correctAnswer); if(correct){a.correct++;a.marks+=4;} else {a.wrong++;a.marks-=1;}
                  } return acc;
                },{})).map(([subject,v])=><tr key={subject}><td>{subject}</td><td style={{textAlign:'center'}}>{v.correct}</td><td style={{textAlign:'center'}}>{v.wrong}</td><td style={{textAlign:'center'}}>{v.unattempted}</td><td style={{textAlign:'right'}}>{v.marks}</td></tr>)}
              </tbody>
            </table>
            <div className="result-actions">
              <button className="submit-btn" style={{flex:1}} onClick={()=>{setResultModalOpen(false);setShowSolutions(true);}}>Review Solutions</button>
              <button className="btn-secondary" onClick={onComplete || onExit}>Exit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
