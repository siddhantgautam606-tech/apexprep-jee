import initialQuestions from '../data/questions.json';

const STORAGE_KEY = 'apexprep_custom_questions';

// Helper to retrieve all questions (built-in + user-appended)
export function getAllQuestions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const custom = saved ? JSON.parse(saved) : [];
    return [...initialQuestions, ...custom];
  } catch (err) {
    console.error('Failed to load questions:', err);
    return initialQuestions;
  }
}

// Helper to append a single new question or a batch without touching codebase
export function appendQuestion(newQuestion) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const custom = saved ? JSON.parse(saved) : [];
    const formatted = {
      ...newQuestion,
      id: newQuestion.id || `custom_${Date.now()}`
    };
    custom.push(formatted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    return true;
  } catch (err) {
    console.error('Failed to append question:', err);
    return false;
  }
}

export function getFilteredQuestions({ subject, chapter, search }) {
  const all = getAllQuestions();
  return all.filter((q) => {
    const matchSubject = subject === 'All' || q.subject === subject;
    const matchChapter = !chapter || chapter === 'All' || q.chapter === chapter;
    const matchSearch =
      !search ||
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.chapter.toLowerCase().includes(search.toLowerCase()) ||
      (q.yearTag && q.yearTag.toLowerCase().includes(search.toLowerCase()));
    return matchSubject && matchChapter && matchSearch;
  });
}

export function getAllSubjects() {
  const all = getAllQuestions();
  return ['All', ...new Set(all.map((q) => q.subject))];
}