import { getAllQuestions } from './questionService';

// Extract available unique chapters dynamically from whatever is inside the Question Pool
export function getAvailableChaptersFromPool() {
  const all = getAllQuestions();
  const map = { Physics: new Set(), Chemistry: new Set(), Math: new Set(), Mathematics: new Set() };

  all.forEach((q) => {
    const sub = q.subject === 'Mathematics' ? 'Math' : q.subject;
    if (map[sub]) {
      map[sub].add(q.chapter);
    }
  });

  return {
    Physics: Array.from(map.Physics),
    Chemistry: Array.from(map.Chemistry),
    Math: Array.from(new Set([...map.Math, ...map.Mathematics]))
  };
}

// Draw test questions directly from Question Pool
export function filterAndSampleQuestions({ subjects, selectedChapters, targetCount }) {
  const all = getAllQuestions();

  // Normalize questions so both legacy and pool formats work seamlessly
  const normalized = all.map((q, idx) => ({
    id: q.id || idx + 1,
    subject: q.subject === 'Mathematics' ? 'Math' : q.subject,
    chapter: q.chapter || 'General',
    section: q.section || (idx >= 20 ? 'Section B' : 'Section A'),
    meta: q.yearTag || q.meta || 'JEE Practice',
    type: q.type || (Array.isArray(q.options) && q.options.length > 0 ? 'MCQ' : 'NUM'),
    text: q.question || q.text,
    options: Array.isArray(q.options)
      ? q.options.map((opt, oIdx) =>
          typeof opt === 'string'
            ? { key: String.fromCharCode(65 + oIdx), text: opt }
            : opt
        )
      : [],
    correct:
      typeof q.correctIndex === 'number'
        ? String.fromCharCode(65 + q.correctIndex)
        : String(q.correct || '').trim(),
    solution: q.explanation || q.solution || 'No detailed explanation provided.',
    graphicSvg: q.graphicSvg || null
  }));

  // Filter against active selections
  let pool = normalized.filter((q) => {
    const normSub = q.subject === 'Mathematics' ? 'Math' : q.subject;
    const mappedSubjects = subjects.map((s) => (s === 'Mathematics' ? 'Math' : s));
    const subjectOk = mappedSubjects.length === 0 || mappedSubjects.includes(normSub);
    const chapterOk = selectedChapters.length === 0 || selectedChapters.includes(q.chapter);
    return subjectOk && chapterOk;
  });

  // Fallback to all if selected pool is empty
  if (pool.length === 0) pool = normalized;

  // Shuffle and sample
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(targetCount, shuffled.length));
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
    const subKey = q.subject === 'Mathematics' ? 'Math' : q.subject;
    const s = subStats[subKey] || subStats['Physics'];

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