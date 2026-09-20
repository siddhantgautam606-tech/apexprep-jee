export const SAMPLE_QUESTIONS = [
  {
    id: 'q1',
    subject: 'Physics',
    chapter: 'Kinematics',
    yearTag: 'JEE Main 2024 (Shift 1)',
    difficulty: 'Medium',
    question: 'A projectile is launched from ground level at an angle of 45° with an initial speed of 20 m/s. Taking g = 10 m/s², what is the total horizontal range?',
    options: ['20 m', '40 m', '60 m', '80 m'],
    correctIndex: 1,
    explanation: 'Horizontal Range R = (u² * sin(2θ)) / g. For θ = 45°, sin(2θ) = sin(90°) = 1. Therefore, R = (20² * 1) / 10 = 400 / 10 = 40 m.'
  },
  {
    id: 'q2',
    subject: 'Physics',
    chapter: 'Electrodynamics',
    yearTag: 'JEE Main 2023 (Shift 2)',
    difficulty: 'Hard',
    question: 'Two concentric conducting spherical shells of radii R and 2R carry charges Q and 2Q respectively. The electric potential at distance 1.5R from the common center is:',
    options: ['kQ / R', '2kQ / R', '5kQ / (3R)', '4kQ / (3R)'],
    correctIndex: 2,
    explanation: 'Potential V = k * Q_inner / r + k * Q_outer / R_outer = k*Q/(1.5R) + k*(2Q)/(2R) = 2kQ/(3R) + kQ/R = 5kQ / (3R).'
  },
  {
    id: 'q3',
    subject: 'Chemistry',
    chapter: 'Thermodynamics',
    yearTag: 'JEE Main 2024 (Shift 2)',
    difficulty: 'Easy',
    question: 'For an isolated system undergoing an irreversible spontaneous expansion, the total entropy change (ΔS_total) is always:',
    options: ['Zero', 'Negative', 'Positive', 'Dependent on external pressure'],
    correctIndex: 2,
    explanation: 'According to the Second Law of Thermodynamics, any spontaneous natural process in an isolated system leads to an increase in overall entropy: ΔS_universe > 0.'
  },
  {
    id: 'q4',
    subject: 'Mathematics',
    chapter: 'Calculus',
    yearTag: 'JEE Advanced 2022',
    difficulty: 'Hard',
    question: 'Evaluate the limit: lim(x → 0) [(1 - cos(2x)) / (x * sin(x))].',
    options: ['0', '1', '2', '1/2'],
    correctIndex: 2,
    explanation: 'Using standard limits: 1 - cos(2x) = 2*sin²(x). Thus, 2*sin²(x) / (x * sin(x)) = 2 * (sin(x)/x) = 2 * 1 = 2.'
  },
  {
    id: 'q5',
    subject: 'Mathematics',
    chapter: 'Coordinate Geometry',
    yearTag: 'JEE Main 2023 (Shift 1)',
    difficulty: 'Medium',
    question: 'The distance between the parallel lines 3x + 4y - 9 = 0 and 6x + 8y + 12 = 0 is:',
    options: ['2 units', '3 units', '1.5 units', '5 units'],
    correctIndex: 1,
    explanation: 'Rewrite line 2 as 3x + 4y + 6 = 0. Distance d = |c1 - c2| / √(a² + b²) = |-9 - 6| / √(3² + 4²) = 15 / 5 = 3 units.'
  }
];

export function getFilteredQuestions({ subject, chapter, search }) {
  return SAMPLE_QUESTIONS.filter((q) => {
    const matchSubject = subject === 'All' || q.subject === subject;
    const matchChapter = chapter === 'All' || q.chapter === chapter;
    const matchSearch =
      !search ||
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.yearTag.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchChapter && matchSearch;
  });
}

export function getAllSubjects() {
  return ['All', ...new Set(SAMPLE_QUESTIONS.map((q) => q.subject))];
}