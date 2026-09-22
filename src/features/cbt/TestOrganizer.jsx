import React, { useState } from 'react';
import TestConfig from './TestConfig';
import TestRunner from './TestRunner';
import { getStandardQuestions } from '../../data/jeeQuestionBank';
import { fetchQuestionsForTest } from '../../services/circleService';

export default function TestOrganizer({ currentUser }) {
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

  const handleStartTest = async () => {
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
            safeCount
          );
        }
      } catch (err) {
        console.warn('DB fetch failed, using standard bank:', err);
      }

      // 2. Standard JEE question bank fallback
      if (!Array.isArray(loadedQuestions) || loadedQuestions.length === 0) {
        const subForBank = safeSubject === 'All' || safeSubject === 'Full Syllabus' ? 'Physics' : safeSubject;
        loadedQuestions = getStandardQuestions(subForBank, primaryChapter, safeCount);
      }

      // 3. Absolute failsafe generator
      if (!Array.isArray(loadedQuestions) || loadedQuestions.length === 0) {
        loadedQuestions = Array.from({ length: safeCount }, (_, i) => ({
          id: i + 1,
          question: `Sample Practice Question ${i + 1} (${safeSubject} - ${safeChapterLabel})`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: 'Standard JEE concept application.'
        }));
      }

      setActiveTest({
        id: 'practice-' + Date.now(),
        title: `${safeSubject === 'All' ? 'Full Syllabus' : safeSubject} Practice CBT`,
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
    <div className="w-full max-w-4xl mx-auto py-4">
      <TestConfig
        config={config}
        onChangeConfig={(newCfg) => setConfig(newCfg)}
        onStartTest={handleStartTest}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}