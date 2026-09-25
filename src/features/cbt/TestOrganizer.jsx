import React, { useState } from 'react';
import TestConfig from './TestConfig';
import TestRunner from './TestRunner';
import { getStandardQuestions } from '../../data/jeeQuestionBank';
import { getStandardNEETQuestions } from '../../data/neetQuestionBank';
import { fetchQuestionsForTest } from '../../services/circleService';
import { normalizeExam } from '../../config/examConfig';

export default function TestOrganizer({ currentUser, feedExam }) {
  const exam = normalizeExam(feedExam || currentUser?.target_exam);
  // Config with full multi-chapter state
  const [config, setConfig] = useState({
    subject: 'All',
    selectedChapters: ['All'],
    chapter: 'All',
    durationMinutes: 60,
    questionCount: exam === 'NEET' ? 100 : 25
  });

  const [activeTest, setActiveTest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleStartTest = async () => {
    // ==========================================
    // CREATOR BYPASS & DAILY LIMIT GUARDRAIL
    // ==========================================
    const isCreator = true; // As requested, no restrictions for you as the creator!
    
    if (!isCreator) {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `prepxai_tests_${today}`;
      const testsTakenToday = parseInt(localStorage.getItem(storageKey) || '0', 10);

      if (testsTakenToday >= 4) {
        setShowLimitModal(true);
        return; // Block test launch
      }

      // Increment count for regular users
      localStorage.setItem(storageKey, testsTakenToday + 1);
    }
    // ==========================================

    setIsSubmitting(true);
    let loadedQuestions = [];

    const safeSubject = config?.subject || 'All';
    const chaptersList = Array.isArray(config?.selectedChapters) 
      ? config.selectedChapters 
      : ['All'];
    const safeChapterLabel = chaptersList.includes('All') ? 'All' : chaptersList.join(', ');
    const primaryChapter = chaptersList.includes('All') ? 'All' : chaptersList[0];
    const safeDuration = [60, 120, 180].includes(Number(config?.durationMinutes)) ? Number(config.durationMinutes) : 60;
    const safeCount = exam === 'NEET'
      ? ({ 60: 100, 120: 200, 180: 300 }[safeDuration] || 100)
      : ({ 60: 25, 120: 50, 180: 75 }[safeDuration] || 25);

    try {
      const isFullSyllabus = safeSubject === 'All' || safeSubject === 'Full Syllabus';

      // Full-syllabus tests are built subject-by-subject. This prevents a broad
      // database query from mixing subjects before the CBT sections are created.
      if (isFullSyllabus) {
        const subjectCounts = exam === 'NEET'
          ? { Physics: Math.floor(safeCount * 0.34), Chemistry: Math.floor(safeCount * 0.33), Biology: safeCount - Math.floor(safeCount * 0.34) - Math.floor(safeCount * 0.33) }
          : { Physics: Math.ceil(safeCount / 3), Chemistry: Math.floor((safeCount - Math.ceil(safeCount / 3)) / 2), Mathematics: safeCount - Math.ceil(safeCount / 3) - Math.floor((safeCount - Math.ceil(safeCount / 3)) / 2) };

        loadedQuestions = [];
        for (const [subjectName, count] of Object.entries(subjectCounts)) {
          let subjectQuestions = [];
          try {
            subjectQuestions = await fetchQuestionsForTest(subjectName, primaryChapter, count, exam);
          } catch (err) {
            console.warn(`DB fetch failed for ${subjectName}, using standard bank:`, err);
          }

          if (!Array.isArray(subjectQuestions) || subjectQuestions.length < count) {
            const fallback = exam === 'NEET'
              ? getStandardNEETQuestions(subjectName, primaryChapter, count)
              : getStandardQuestions(subjectName, primaryChapter, count);
            const existingIds = new Set((subjectQuestions || []).map((q) => q.id));
            subjectQuestions = [
              ...(subjectQuestions || []),
              ...(Array.isArray(fallback) ? fallback.filter((q) => !existingIds.has(q.id)) : [])
            ].slice(0, count);
          }

          // Stamp the subject onto every question so the runner can derive
          // sections from the actual question data rather than fixed indexes.
          loadedQuestions.push(...subjectQuestions.map((q) => ({ ...q, subject: subjectName })));
        }
      } else {
        try {
          loadedQuestions = await fetchQuestionsForTest(safeSubject, primaryChapter, safeCount, exam);
        } catch (err) {
          console.warn('DB fetch failed, using standard bank:', err);
        }

        if (!Array.isArray(loadedQuestions) || loadedQuestions.length < safeCount) {
          const fallback = exam === 'NEET'
            ? getStandardNEETQuestions(safeSubject, primaryChapter, safeCount)
            : getStandardQuestions(safeSubject, primaryChapter, safeCount);
          const existingIds = new Set((loadedQuestions || []).map((q) => q.id));
          loadedQuestions = [
            ...(loadedQuestions || []),
            ...(Array.isArray(fallback) ? fallback.filter((q) => !existingIds.has(q.id)) : [])
          ].slice(0, safeCount);
        }
        loadedQuestions = loadedQuestions.map((q) => ({ ...q, subject: q.subject || safeSubject }));
      }

      // Absolute failsafe generator
      if (!Array.isArray(loadedQuestions) || loadedQuestions.length === 0) {
        loadedQuestions = Array.from({ length: safeCount }, (_, i) => ({
          id: i + 1,
          question: `Sample Practice Question ${i + 1} (${safeSubject} - ${safeChapterLabel})`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: `Standard ${exam} concept application.`
        }));
      }

      setActiveTest({
        id: 'practice-' + Date.now(),
        title: `${exam} • ${safeSubject === 'All' ? 'Full Syllabus' : safeSubject} Practice CBT`,
        exam,
        subject: safeSubject,
        chapter: safeChapterLabel,
        durationMinutes: safeDuration,
        questionCount: safeCount,
        questions: loadedQuestions
      });
    } catch (err) {
      console.error('Error initiating practice test:', err);
      alert('Could not start test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (activeTest) {
    return (
      <TestRunner
        test={activeTest}
        currentUser={currentUser}
        onComplete={() => setActiveTest(null)}
        onExit={() => setActiveTest(null)}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-4 relative">
      <TestConfig
        config={config}
        exam={exam}
        onChangeConfig={(newCfg) => setConfig(newCfg)}
        onStartTest={handleStartTest}
        isSubmitting={isSubmitting}
      />

      {/* Upgrade / Daily Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl shadow-indigo-500/10">
            <div className="w-12 h-12 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/30 font-bold text-lg">
              4/4
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Daily Free Limit Reached</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              You've completed your 4 free practice tests for today. Upgrade to Premium to unlock unlimited daily mock tests, handwritten revision notes, and exclusive Friend Circles!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLimitModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Redirecting to Premium Upgrade Tiers...');
                  setShowLimitModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
              >
                Unlock Premium
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}