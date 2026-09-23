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
    durationMinutes: 30,
    questionCount: 10
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
    const safeCount = Number(config?.questionCount) || 10;
    const safeDuration = Number(config?.durationMinutes) || 30;

    try {
      // 1. Try DB question pool
      try {
        if (typeof fetchQuestionsForTest === 'function') {
          loadedQuestions = await fetchQuestionsForTest(
            safeSubject,
            primaryChapter,
            safeCount,
            exam
          );
        }
      } catch (err) {
        console.warn('DB fetch failed, using standard bank:', err);
      }

      // 2. Exam-specific standard question bank fallback
      if (!Array.isArray(loadedQuestions) || loadedQuestions.length === 0) {
        const subForBank = safeSubject === 'All' || safeSubject === 'Full Syllabus' ? 'Physics' : safeSubject;
        loadedQuestions = exam === 'NEET'
          ? getStandardNEETQuestions(safeSubject === 'All' || safeSubject === 'Full Syllabus' ? 'All' : subForBank, primaryChapter, safeCount)
          : getStandardQuestions(subForBank, primaryChapter, safeCount);
      }

      // 3. Absolute failsafe generator
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