/**
 * Standard JEE Marking Scheme:
 * Correct: +4
 * Incorrect: -1
 * Unattempted: 0
 */
export function computeExamStats(questions = [], answers = {}, timeTakenSeconds = 0) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return {
      totalQuestions: 0,
      attempted: 0,
      correct: 0,
      incorrect: 0,
      unattempted: 0,
      score: 0,
      maxScore: 0,
      accuracy: 0,
      timeTakenFormatted: '00:00',
      subjectBreakdown: {}
    };
  }

  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  let subjectStats = {};

  questions.forEach((q, idx) => {
    const sub = q.subject || 'General';
    if (!subjectStats[sub]) {
      subjectStats[sub] = { total: 0, correct: 0, incorrect: 0, score: 0 };
    }
    subjectStats[sub].total += 1;

    // Check both index key (0, 1, 2) and question ID key
    const userChoice = answers[idx] !== undefined ? answers[idx] : answers[q.id];

    // Determine correct answer (0-3 index or letter 'A','B','C','D')
    let correctChoice = q.correctAnswer !== undefined ? q.correctAnswer : q.correct_answer;
    if (typeof correctChoice === 'string') {
      const upper = correctChoice.trim().toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(upper)) {
        correctChoice = upper.charCodeAt(0) - 65;
      } else if (!isNaN(Number(upper))) {
        correctChoice = Number(upper);
      }
    }

    if (userChoice === undefined || userChoice === null || userChoice === '') {
      unattemptedCount += 1;
    } else if (Number(userChoice) === Number(correctChoice)) {
      correctCount += 1;
      subjectStats[sub].correct += 1;
      subjectStats[sub].score += 4;
    } else {
      incorrectCount += 1;
      subjectStats[sub].incorrect += 1;
      subjectStats[sub].score -= 1;
    }
  });

  const attemptedCount = correctCount + incorrectCount;
  const totalScore = (correctCount * 4) - (incorrectCount * 1);
  const maxPossibleScore = questions.length * 4;

  const accuracyPct = attemptedCount > 0 
    ? Math.max(0, Math.round((correctCount / attemptedCount) * 100)) 
    : 0;

  const minutes = Math.floor(timeTakenSeconds / 60);
  const seconds = timeTakenSeconds % 60;
  const timeTakenFormatted = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;

  return {
    totalQuestions: questions.length,
    attempted: attemptedCount,
    correct: correctCount,
    incorrect: incorrectCount,
    unattempted: unattemptedCount,
    score: totalScore,
    maxScore: maxPossibleScore,
    accuracy: accuracyPct,
    timeTakenSeconds,
    timeTakenFormatted,
    subjectBreakdown: subjectStats
  };
}

/**
 * Filter questions based on subject, chapter, and sample count
 */
export function filterAndSampleQuestions(pool = [], config = {}) {
  let filtered = [...pool];

  if (config.subject && config.subject !== 'All' && config.subject !== 'Full Syllabus') {
    filtered = filtered.filter(
      (q) => q.subject && q.subject.toLowerCase() === config.subject.toLowerCase()
    );
  }

  if (config.chapter && config.chapter !== 'All') {
    const chaptersToMatch = Array.isArray(config.chapter)
      ? config.chapter
      : config.chapter.split(',').map((c) => c.trim().toLowerCase());

    filtered = filtered.filter((q) =>
      q.chapter && chaptersToMatch.includes(q.chapter.toLowerCase())
    );
  }

  // Shuffle questions randomly
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());

  const count = Number(config.questionCount || config.count) || 5;
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Extract unique chapters list from question pool for a specific subject
 */
export function getAvailableChaptersFromPool(pool = [], subject = 'All') {
  if (!Array.isArray(pool) || pool.length === 0) return ['All'];

  let relevant = pool;
  if (subject && subject !== 'All' && subject !== 'Full Syllabus') {
    relevant = pool.filter(
      (q) => q.subject && q.subject.toLowerCase() === subject.toLowerCase()
    );
  }

  const chapters = Array.from(
    new Set(relevant.map((q) => q.chapter).filter(Boolean))
  );

  return ['All', ...chapters];
}

/**
 * General filter questions helper
 */
export function filterQuestions(pool = [], filters = {}) {
  return filterAndSampleQuestions(pool, filters);
}