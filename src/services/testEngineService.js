import { CBT_75_QUESTIONS } from '../data/mock75Questions';

export function filterAndSampleQuestions({ subjects, selectedChapters, targetCount }) {
  let pool = CBT_75_QUESTIONS.filter((q) => {
    const subjectOk = subjects.length === 0 || subjects.includes(q.subject);
    const chapterOk = selectedChapters.length === 0 || selectedChapters.includes(q.chapter);
    return subjectOk && chapterOk;
  });

  if (pool.length === 0) pool = CBT_75_QUESTIONS;

  if (targetCount === 75 || pool.length <= targetCount) {
    return [...pool].slice(0, targetCount);
  }

  // Shuffle sample if smaller count chosen
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, targetCount);
}

export function computeExamStats(testQuestions, userAnswers) {
  let totalScore = 0;
  let totalCorrect = 0;
  let totalAttempted = 0;

  const subStats = {
    Physics: { correct: 0, wrong: 0, unattempted: 0, score: 0 },
    Chemistry: { correct: 0, wrong: 0, unattempted: 0, score: 0 },
    Math: { correct: 0, wrong: 0, unattempted: 0, score: 0 }
  };

  testQuestions.forEach((q) => {
    const given = userAnswers[q.id];
    const s = subStats[q.subject] || subStats['Physics'];

    if (given === undefined || given === '') {
      s.unattempted++;
    } else {
      totalAttempted++;
      const isCor = String(given).trim().toLowerCase() === String(q.correct).trim().toLowerCase();
      if (isCor) {
        totalCorrect++;
        s.correct++;
        s.score += 4;
        totalScore += 4;
      } else {
        s.wrong++;
        s.score -= 1;
        totalScore -= 1;
      }
    }
  });

  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  return { totalScore, totalCorrect, totalAttempted, accuracy, subStats };
}