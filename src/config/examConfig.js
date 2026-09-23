export const EXAM_OPTIONS = ['JEE Main', 'JEE Advanced', 'NEET'];

export const EXAM_CONFIG = {
  'JEE Main': {
    key: 'jee',
    label: 'JEE Main',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    syllabusKey: 'JEE',
    scoring: { correct: 4, incorrect: -1 }
  },
  'JEE Advanced': {
    key: 'jee_advanced',
    label: 'JEE Advanced',
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
  return EXAM_CONFIG[exam] ? exam : 'JEE Main';
}

export function getExamConfig(exam) {
  return EXAM_CONFIG[normalizeExam(exam)];
}
