import { fetchQuestionsForTest } from './questionService';
import { formatMathSymbols, getStandardQuestions } from '../data/jeeQuestionBank';
import { QUESTIONS_POOL } from '../data/questionsPool';

/**
 * Calculates candidate score, accuracy, and subject breakdown for TestRunner.jsx
 */
export function computeExamStats(questions = [], answers = {}, totalTimeSeconds = 0) {
  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;

  const subjectStats = {};

  questions.forEach((q, idx) => {
    const sub = q.subject || 'General';
    if (!subjectStats[sub]) {
      subjectStats[sub] = { total: 0, correct: 0, incorrect: 0, score: 0 };
    }
    subjectStats[sub].total += 1;

    const userAns = answers[idx] ?? answers[q.id];

    if (userAns === undefined || userAns === null) {
      unattempted += 1;
    } else if (Number(userAns) === Number(q.correctAnswer)) {
      correct += 1;
      subjectStats[sub].correct += 1;
      subjectStats[sub].score += 4;
    } else {
      incorrect += 1;
      subjectStats[sub].incorrect += 1;
      subjectStats[sub].score -= 1;
    }
  });

  const attempted = correct + incorrect;
  const rawScore = correct * 4 - incorrect * 1;
  const maxScore = questions.length * 4;
  const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : 0;

  return {
    correct,
    incorrect,
    unattempted,
    attempted,
    total: questions.length,
    score: rawScore,
    maxScore,
    accuracy: Number(accuracy),
    subjectStats,
    timeTakenSeconds: totalTimeSeconds
  };
}

/**
 * Extracts available chapters for a subject from QUESTIONS_POOL
 */
export function getAvailableChaptersFromPool(subject) {
  if (!subject || subject === 'Full Syllabus' || subject === 'All') {
    return ['All'];
  }

  const pool = Array.isArray(QUESTIONS_POOL) ? QUESTIONS_POOL : [];
  const chapters = new Set();

  pool.forEach((q) => {
    if (q.subject?.toLowerCase() === subject.toLowerCase() && q.chapter) {
      chapters.add(q.chapter);
    }
  });

  return ['All', ...Array.from(chapters)];
}

/**
 * Samples questions synchronously from QUESTIONS_POOL
 */
export function filterAndSampleQuestions(config = {}) {
  const { subject = 'Physics', chapter = 'All', count = 25 } = config;
  let pool = Array.isArray(QUESTIONS_POOL) ? [...QUESTIONS_POOL] : [];

  if (subject && subject !== 'Full Syllabus' && subject !== 'All') {
    pool = pool.filter((q) => q.subject?.toLowerCase() === subject.toLowerCase());
  }
  if (chapter && chapter !== 'All') {
    pool = pool.filter((q) => q.chapter?.toLowerCase() === chapter.toLowerCase());
  }

  const shuffled = pool.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  if (selected.length < count) {
    const needed = count - selected.length;
    const fallback = getStandardQuestions(
      subject === 'Full Syllabus' || subject === 'All' ? 'Physics' : subject,
      chapter,
      needed
    );
    selected.push(...fallback);
  }

  return selected.slice(0, count).map((q, idx) => ({
    ...q,
    id: q.id || idx + 1,
    question: formatMathSymbols(q.question),
    options: Array.isArray(q.options) ? q.options.map((opt) => formatMathSymbols(opt)) : [],
    explanation: formatMathSymbols(q.explanation || '')
  }));
}

/**
 * Async paper generator for individual practice tests
 */
export async function generatePersonalTestPaper(config = {}) {
  const subject = config.subject || 'Full Syllabus';
  const chapter = config.chapter || 'All';
  const totalCount = Number(config.questionCount) || 25;

  if (subject === 'Full Syllabus') {
    const perSubject = Math.floor(totalCount / 3);
    const remainder = totalCount % 3;

    const [physics, chemistry, math] = await Promise.all([
      fetchQuestionsForTest('Physics', 'All', perSubject + remainder),
      fetchQuestionsForTest('Chemistry', 'All', perSubject),
      fetchQuestionsForTest('Mathematics', 'All', perSubject)
    ]);

    return [...physics, ...chemistry, ...math];
  }

  return await fetchQuestionsForTest(subject, chapter, totalCount);
}

export { formatMathSymbols };