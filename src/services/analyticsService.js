const ANALYTICS_STORAGE_KEY = 'apexprep_test_history';

export function getTestHistory() {
  try {
    const data = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to load test history:', err);
    return [];
  }
}

export function saveTestAttempt({ testQuestions, userAnswers, examResults, durationMinutes }) {
  try {
    const history = getTestHistory();
    const newAttempt = {
      id: `attempt_${Date.now()}`,
      timestamp: new Date().toISOString(),
      questionCount: testQuestions.length,
      durationMinutes,
      score: examResults.totalScore,
      totalPossibleScore: testQuestions.length * 4,
      accuracy: examResults.accuracy,
      correctCount: examResults.totalCorrect,
      attemptedCount: examResults.totalAttempted,
      subjectBreakdown: examResults.subStats,
      // Record chapter-level stats for weak-area detection
      chapterBreakdown: testQuestions.map((q) => {
        const given = userAnswers[q.id];
        const isAttempted = given !== undefined && given !== '';
        const isCorrect = isAttempted && String(given).trim().toLowerCase() === String(q.correct).trim().toLowerCase();
        return {
          subject: q.subject === 'Mathematics' ? 'Math' : q.subject,
          chapter: q.chapter || 'General',
          isAttempted,
          isCorrect
        };
      })
    };

    history.unshift(newAttempt);
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch (err) {
    console.error('Failed to save test attempt:', err);
    return false;
  }
}

export function computeOverallAnalytics() {
  const history = getTestHistory();

  if (history.length === 0) {
    return {
      hasData: false,
      totalTests: 0,
      averageScore: 0,
      averageAccuracy: 0,
      totalAttemptedQuestions: 0,
      chapterMastery: [],
      weakChapters: [],
      moderateChapters: [],
      strongChapters: []
    };
  }

  let totalScore = 0;
  let totalPossibleScore = 0;
  let totalCorrect = 0;
  let totalAttempted = 0;

  const chapterStats = {};

  history.forEach((attempt) => {
    totalScore += attempt.score;
    totalPossibleScore += attempt.totalPossibleScore;
    totalCorrect += attempt.correctCount;
    totalAttempted += attempt.attemptedCount;

    attempt.chapterBreakdown?.forEach((item) => {
      const key = `${item.subject}::${item.chapter}`;
      if (!chapterStats[key]) {
        chapterStats[key] = { subject: item.subject, chapter: item.chapter, total: 0, correct: 0 };
      }
      if (item.isAttempted) {
        chapterStats[key].total++;
        if (item.isCorrect) chapterStats[key].correct++;
      }
    });
  });

  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const averageScore = Math.round(totalScore / history.length);

  const chapterMastery = Object.values(chapterStats).map((ch) => {
    const accuracy = ch.total > 0 ? Math.round((ch.correct / ch.total) * 100) : 0;
    let status = 'Moderate';
    if (accuracy < 45) status = 'Weak';
    else if (accuracy >= 75) status = 'Strong';

    return {
      ...ch,
      accuracy,
      status
    };
  });

  return {
    hasData: true,
    totalTests: history.length,
    averageScore,
    averageAccuracy: overallAccuracy,
    totalAttemptedQuestions: totalAttempted,
    chapterMastery,
    weakChapters: chapterMastery.filter((c) => c.status === 'Weak'),
    moderateChapters: chapterMastery.filter((c) => c.status === 'Moderate'),
    strongChapters: chapterMastery.filter((c) => c.status === 'Strong'),
    recentAttempts: history.slice(0, 5)
  };
}