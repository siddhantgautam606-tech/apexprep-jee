import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Bookmark, Award, RotateCcw, Play, CheckSquare, Square } from 'lucide-react';
import { QUESTIONS_POOL } from '../data/questionsPool';
import { SYLLABUS_DATA } from '../data/syllabusData';

export default function CbtTestSection({ onRecordScore }) {
  // Test Config State
  const [selectedChapters, setSelectedChapters] = useState(['kinematics', 'thermo-chem', 'calculus-diff']);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [questionCount, setQuestionCount] = useState(15);
  
  // Test Runner State
  const [isTesting, setIsTesting] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Collect all available chapters across subjects
  const allChapters = [];
  Object.keys(SYLLABUS_DATA).forEach(subjKey => {
    SYLLABUS_DATA[subjKey].chapters.forEach(ch => {
      allChapters.push({
        id: ch.id,
        name: ch.name,
        subject: SYLLABUS_DATA[subjKey].title
      });
    });
  });

  const toggleChapter = (id) => {
    setSelectedChapters(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleStartCbt = () => {
    if (selectedChapters.length === 0) return;

    // Filter questions matching chosen chapters
    const eligible = QUESTIONS_POOL.filter(q => selectedChapters.includes(q.chapterId));
    // Shuffle & slice to desired count
    const shuffled = [...eligible].sort(() => 0.5 - Math.random());
    const finalSet = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    setTestQuestions(finalSet);
    setTimeLeft(durationMinutes * 60);
    setAnswers({});
    setMarkedForReview({});
    setCurrentIdx(0);
    setIsSubmitted(false);
    setIsTesting(true);
  };

  // CBT Countdown Timer
  useEffect(() => {
    let timer;
    if (isTesting && !isSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitCbt();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTesting, isSubmitted, timeLeft]);

  const handleSubmitCbt = () => {
    setIsSubmitted(true);
    let score = 0;
    let correct = 0;
    let attempted = 0;

    testQuestions.forEach((q, idx) => {
      if (answers[idx] !== undefined) {
        attempted++;
        if (answers[idx] === q.correctIndex) {
          score += 4;
          correct++;
        } else {
          score -= 1;
        }
      }
    });

    if (onRecordScore) {
      onRecordScore({
        subtopicId: 'custom-cbt',
        subtopicTitle: `CBT Mock (${testQuestions.length} Qs)`,
        subject: 'Multi-Subject',
        score,
        totalPossible: testQuestions.length * 4,
        accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  };

  const formatTimer = (s) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 1. CONFIGURATION SCREEN
  if (!isTesting) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-2">Custom CBT Test Builder</h2>
          <p className="text-xs text-slate-400 mb-6">
            Configure your chapters, question count, and duration to generate an instant Computer-Based Test.
          </p>

          <div className="space-y-6">
            {/* Chapter Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
                1. Select Chapters to Include ({selectedChapters.length} selected)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allChapters.map(ch => {
                  const isChecked = selectedChapters.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => toggleChapter(ch.id)}
                      className={`text-left p-3.5 rounded-2xl border transition flex items-center justify-between text-xs font-medium ${
                        isChecked 
                          ? 'bg-blue-600/20 border-blue-500 text-white' 
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] text-blue-400 font-semibold uppercase block">{ch.subject}</span>
                        <span>{ch.name}</span>
                      </div>
                      {isChecked ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test Duration */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
                2. Test Duration
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[15, 30, 60, 180].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition ${
                      durationMinutes === mins
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mins >= 60 ? `${mins / 60} hr` : `${mins} mins`}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
                3. Number of Questions
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[5, 10, 15, 25].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition ${
                      questionCount === cnt
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={selectedChapters.length === 0}
              onClick={handleStartCbt}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 text-sm mt-4"
            >
              <Play className="w-4 h-4 fill-white" /> Launch CBT Test Environment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE CBT TEST SCREEN (NTA / JEE Style Layout)
  if (!isSubmitted) {
    return (
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 cols: Question Area */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[550px]">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full">
                  {testQuestions[currentIdx]?.yearTag}
                </span>
                <h3 className="text-sm font-bold text-white mt-2">
                  Question {currentIdx + 1} of {testQuestions.length}
                </h3>
              </div>

              <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl text-emerald-400 font-mono text-sm font-bold border border-slate-700">
                <Clock className="w-4 h-4" />
                {formatTimer(timeLeft)}
              </div>
            </div>

            <p className="text-base text-slate-200 font-medium leading-relaxed mb-6">
              {testQuestions[currentIdx]?.text}
            </p>

            <div className="space-y-3">
              {testQuestions[currentIdx]?.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: oIdx }))}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition flex items-center justify-between ${
                    answers[currentIdx] === oIdx
                      ? 'bg-blue-600/20 border-blue-500 text-white font-medium'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span><strong className="mr-2 text-slate-400">{String.fromCharCode(65 + oIdx)}.</strong> {opt}</span>
                  {answers[currentIdx] === oIdx && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-800 mt-8">
            <button
              onClick={() => setMarkedForReview(prev => ({ ...prev, [currentIdx]: !prev[currentIdx] }))}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                markedForReview[currentIdx] 
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              {markedForReview[currentIdx] ? 'Marked for Review' : 'Mark for Review'}
            </button>

            <div className="flex gap-2">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => prev - 1)}
                className="text-xs px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
              >
                Previous
              </button>

              {currentIdx < testQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="text-xs px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Save & Next
                </button>
              ) : (
                <button
                  onClick={handleSubmitCbt}
                  className="text-xs px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Submit Test
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 col: Question Palette */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Question Palette</h4>
          <div className="grid grid-cols-5 gap-2">
            {testQuestions.map((_, i) => {
              const isAnswered = answers[i] !== undefined;
              const isReview = markedForReview[i];
              const isCurrent = currentIdx === i;

              let bg = 'bg-slate-800 text-slate-400 border-slate-700';
              if (isReview) bg = 'bg-purple-600 text-white border-purple-500';
              else if (isAnswered) bg = 'bg-emerald-600 text-white border-emerald-500';

              return (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`h-9 rounded-xl border text-xs font-bold transition ${bg} ${
                    isCurrent ? 'ring-2 ring-blue-400' : ''
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] space-y-1.5 pt-4 border-t border-slate-800 text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" /> Marked for Review
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-800 inline-block" /> Unanswered
            </div>
          </div>

          <button
            onClick={handleSubmitCbt}
            className="w-full mt-4 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white text-emerald-400 text-xs font-bold py-2.5 rounded-xl transition"
          >
            End Test & View Results
          </button>
        </div>
      </div>
    );
  }

  // 3. SCORECARD & INSTANT DETAILED RESULTS
  let score = 0;
  let correct = 0;
  let attempted = 0;
  testQuestions.forEach((q, idx) => {
    if (answers[idx] !== undefined) {
      attempted++;
      if (answers[idx] === q.correctIndex) {
        score += 4;
        correct++;
      } else {
        score -= 1;
      }
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6">
        <div className="p-4 bg-blue-500/10 text-blue-400 rounded-full inline-block">
          <Award className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">CBT Test Result</h2>
          <p className="text-xs text-slate-400 mt-1">Detailed performance analysis and answer explanations</p>
        </div>

        {/* Score metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-medium">Total Score</span>
            <p className="text-2xl font-bold text-white mt-1">{score} <span className="text-xs text-slate-500">/ {testQuestions.length * 4}</span></p>
          </div>
          <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-medium">Accuracy</span>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {attempted > 0 ? Math.round((correct / attempted) * 100) : 0}%
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-medium">Correct</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{correct}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-medium">Incorrect</span>
            <p className="text-2xl font-bold text-rose-400 mt-1">{attempted - correct}</p>
          </div>
        </div>

        {/* Question by question solutions */}
        <div className="text-left space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white">Question Solutions</h3>
          {testQuestions.map((q, idx) => {
            const isCorrect = answers[idx] === q.correctIndex;
            const isAttempted = answers[idx] !== undefined;

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
                <div className="bg-slate-900/70 p-3.5 rounded-xl text-xs text-slate-300 border border-slate-800">
                  <span className="text-blue-400 font-bold block mb-1">Correct Answer: {q.options[q.correctIndex]}</span>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setIsTesting(false)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-2xl text-xs transition inline-flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Build Another CBT Test
        </button>
      </div>
    </div>
  );
}