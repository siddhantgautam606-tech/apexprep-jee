export const EXAM_OPTIONS = ['JEE', 'NEET'];

export const EXAM_CONFIG = {
  JEE: {
    key: 'jee',
    label: 'JEE',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    syllabusKey: 'JEE',
    scoring: { correct: 4, incorrect: -1 }
  },
  NEET: {
    key: 'neet',
    label: 'NEET',
    subjects: ['Physics', 'Chemistry', 'Biology'],
    syllabusKey: 'NEET',
    scoring: { correct: 4, incorrect: -1 }
  }
};

export function normalizeExam(exam) {
  if (exam === 'JEE Main' || exam === 'JEE Advanced') return 'JEE';
  return EXAM_CONFIG[exam] ? exam : 'JEE';
}

export function getExamConfig(exam) {
  return EXAM_CONFIG[normalizeExam(exam)];
}
