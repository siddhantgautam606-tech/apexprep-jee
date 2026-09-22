import { fetchQuestionsForTest } from './questionService';
import { formatMathSymbols, getStandardQuestions } from '../data/jeeQuestionBank';
import { QUESTIONS_POOL } from '../data/questionsPool';

/**
 * Calculates candidate score, accuracy, and subject breakdown for TestRunner.jsx
 */
export function computeExamStats(questions = [], answers = {}, totalTimeSeconds = 0) {
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalUnattempted = 0;
  let totalScore = 0;

  const subStats = {};

  (questions || []).forEach((q) => {
    const sub = q.subject || 'General';
    if (!subStats[sub]) {
      subStats[sub] = { correct: 0, wrong: 0, unattempted: 0, score: 0 };
    }

    const given = answers[q.id];

    if (given === undefined || given === null || given === '') {
      totalUnattempted += 1;
      subStats[sub].unattempted += 1;
      return;
    }

    const isCorrect = String(given).trim().toLowerCase() === String(q.correct).trim().toLowerCase();

    if (isCorrect) {
      totalCorrect += 1;
      subStats[sub].correct += 1;
      subStats[sub].score += 4;
      totalScore += 4;
    } else {
      totalWrong += 1;
      subStats[sub].wrong += 1;
      // Numerical-type questions carry no negative marking (+4 / 0);
      // only MCQs are +4 / -1, matching the official JEE scheme.
      if (q.type !== 'Numerical' && q.type !== 'NUM') {
        subStats[sub].score -= 1;
        totalScore -= 1;
      }
    }
  });

  const totalAttempted = totalCorrect + totalWrong;
  const total = (questions || []).length;

  return {
    totalCorrect,
    totalWrong,
    totalUnattempted,
    totalAttempted,
    total,
    totalScore,
    maxScore: total * 4,
    accuracy: totalAttempted > 0 ? Number(((totalCorrect / totalAttempted) * 100).toFixed(1)) : 0,
    subStats,
    timeTakenSeconds: totalTimeSeconds
  };
}

/**
 * Extracts available chapters per subject from QUESTIONS_POOL for TestConfig.jsx.
 * Returns { Physics: [...chapterIds], Chemistry: [...], Math: [...] } — the shape
 * TestConfig.jsx indexes into directly (chapterMap.Physics, chapterMap[selectedSubject]).
 */
const SUBJECT_ID_TO_KEY = { physics: 'Physics', chemistry: 'Chemistry', math: 'Math', mathematics: 'Math' };

export function getAvailableChaptersFromPool() {
  const pool = Array.isArray(QUESTIONS_POOL) ? QUESTIONS_POOL : [];
  const bySubject = { Physics: new Set(), Chemistry: new Set(), Math: new Set() };

  pool.forEach((q) => {
    const key = SUBJECT_ID_TO_KEY[String(q?.subjectId || '').toLowerCase()];
    if (key && q.chapterId) {
      bySubject[key].add(q.chapterId);
    }
  });

  return {
    Physics: Array.from(bySubject.Physics),
    Chemistry: Array.from(bySubject.Chemistry),
    Math: Array.from(bySubject.Math)
  };
}

/**
 * Samples questions synchronously from QUESTIONS_POOL for TestOrganizer.jsx.
 * Accepts multi-subject / multi-chapter selections (arrays), matching what
 * TestConfig.jsx -> TestOrganizer.jsx actually passes through.
 */
export function filterAndSampleQuestions(config = {}) {
  const { subjects = [], selectedChapters = [], targetCount = 25 } = config;
  let pool = Array.isArray(QUESTIONS_POOL) ? [...QUESTIONS_POOL] : [];

  if (Array.isArray(subjects) && subjects.length > 0) {
    const wanted = subjects.map((s) => String(s).toLowerCase());
    pool = pool.filter((q) => wanted.includes(String(q?.subjectId || '').toLowerCase()));
  }

  if (Array.isArray(selectedChapters) && selectedChapters.length > 0) {
    pool = pool.filter((q) => selectedChapters.includes(q.chapterId));
  }

  const shuffled = pool.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, targetCount);

  if (selected.length < targetCount) {
    const needed = targetCount - selected.length;
    const fallbackSubject =
      Array.isArray(subjects) && subjects.length === 1
        ? SUBJECT_ID_TO_KEY[String(subjects[0]).toLowerCase()] || subjects[0]
        : 'Physics';
    const fallback = getStandardQuestions(fallbackSubject, 'All', needed);
    selected.push(...fallback);
  }

  return selected.slice(0, targetCount).map((q, idx) => ({
    ...q,
    id: q.id || idx + 1,
    subject: SUBJECT_ID_TO_KEY[String(q?.subjectId || '').toLowerCase()] || q.subject || 'General',
    question: formatMathSymbols(q.question || q.question_text || q.text || ''),
    options: Array.isArray(q.options)
      ? q.options.map((opt) => (typeof opt === 'string' ? formatMathSymbols(opt) : opt?.text ? formatMathSymbols(opt.text) : ''))
      : [],
    correctAnswer:
      q.correctAnswer !== undefined
        ? q.correctAnswer
        : q.correctIndex !== undefined
        ? q.correctIndex
        : q.correct_answer,
    explanation: formatMathSymbols(q.explanation || q.solution || '')
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