import React, { useState } from 'react';
import TestConfig from './TestConfig';
import TestRunner from './TestRunner';
import { filterAndSampleQuestions } from '../../services/testEngineService';

export default function TestOrganizer() {
  const [activeTest, setActiveTest] = useState(null);

  const handleStartExam = ({ subject, selectedChapters, questionCount, durationMinutes }) => {
    const subjects = subject === 'All' ? [] : [subject];
    const questions = filterAndSampleQuestions({
      subjects,
      selectedChapters,
      targetCount: questionCount
    });

    setActiveTest({
      questions,
      durationMinutes
    });
  };

  if (activeTest) {
    return (
      <TestRunner
        testQuestions={activeTest.questions}
        durationMinutes={activeTest.durationMinutes}
        onExit={() => setActiveTest(null)}
      />
    );
  }

  return (
    <div className="w-full flex justify-center py-6">
      <TestConfig onStart={handleStartExam} />
    </div>
  );
}