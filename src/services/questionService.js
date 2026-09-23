import { supabase } from './supabaseClient';
import { getStandardQuestions, formatMathSymbols } from '../data/jeeQuestionBank';
import { getStandardNEETQuestions, NEET_QUESTION_BANK } from '../data/neetQuestionBank';
import { normalizeExam, getExamConfig } from '../config/examConfig';
import { QUESTIONS_POOL } from '../data/questionsPool';

/**
 * Returns all available subjects
 */
export function getAllSubjects(exam = 'JEE Main') {
  return getExamConfig(exam).subjects;
}

const SUBJECT_ID_TO_LABEL = { physics: 'Physics', chemistry: 'Chemistry', math: 'Mathematics', mathematics: 'Mathematics' };

/**
 * Filters questions for QuestionPool.jsx
 */
export function getFilteredQuestions({ subject, chapter, difficulty, search, exam = 'JEE Main' } = {}) {
  const normalizedExam = normalizeExam(exam);
  let list = Array.isArray(QUESTIONS_POOL) ? [...QUESTIONS_POOL] : [];
  if (normalizedExam === 'NEET') {
    const subjects = Object.entries(NEET_QUESTION_BANK).flatMap(([subject, questions]) => questions.map(q => ({ ...q, subject, exam: 'NEET' })));
    list = subjects;
  } else list = list.filter(q => !q.exam || q.exam !== 'NEET');

  if (subject && subject !== 'All') {
    list = list.filter(
      (q) => (SUBJECT_ID_TO_LABEL[String(q.subjectId || '').toLowerCase()] || q.subject) === subject
    );
  }
  if (chapter && chapter !== 'All') {
    list = list.filter(
      (q) => (q.chapterId || q.chapter || '').toLowerCase() === chapter.toLowerCase()
    );
  }
  if (difficulty && difficulty !== 'All') {
    list = list.filter((q) => (q.difficulty || '').toLowerCase() === difficulty.toLowerCase());
  }
  if (search && search.trim()) {
    const s = search.toLowerCase();
    list = list.filter(
      (q) =>
        (q.question || q.text || '').toLowerCase().includes(s) ||
        (q.chapterId || q.chapter || '').toLowerCase().includes(s) ||
        (q.yearTag || '').toLowerCase().includes(s)
    );
  }

  return list.map((q) => {
    const questionText = q.question || q.text || '';
    const correctAnswer = q.correctAnswer !== undefined ? q.correctAnswer : q.correctIndex;
    return {
      ...q,
      subject: SUBJECT_ID_TO_LABEL[String(q.subjectId || '').toLowerCase()] || q.subject,
      chapter: q.chapter || q.chapterId,
      question: formatMathSymbols(questionText),
      options: Array.isArray(q.options) ? q.options.map((opt) => formatMathSymbols(opt)) : [],
      correctAnswer,
      explanation: formatMathSymbols(q.explanation || '')
    };
  });
}

/**
 * Appends question locally and attempts DB sync
 */
export function appendQuestion(newQ) {
  const formatted = {
    ...newQ,
    id: newQ.id || `custom_${Date.now()}`,
    question: formatMathSymbols(newQ.question),
    options: Array.isArray(newQ.options) ? newQ.options.map((opt) => formatMathSymbols(opt)) : [],
    explanation: formatMathSymbols(newQ.explanation || '')
  };

  if (Array.isArray(QUESTIONS_POOL)) {
    QUESTIONS_POOL.push(formatted);
  }
  return formatted;
}

/**
 * Adds a new question to the shared database pool via website UI.
 */
export async function addCustomQuestionToDB(questionData, userId) {
  try {
    const formattedQuestion = formatMathSymbols(questionData.question);
    const formattedOptions = Array.isArray(questionData.options)
      ? questionData.options.map((opt) => formatMathSymbols(opt))
      : [];
    const formattedExplanation = formatMathSymbols(questionData.explanation || '');

    const { data, error } = await supabase
      .from('custom_questions')
      .insert([
        {
          subject: questionData.subject,
          chapter: questionData.chapter || 'All',
          exam: questionData.exam || 'JEE Main',
          year_tag: questionData.yearTag || null,
          question: formattedQuestion,
          options: formattedOptions,
          correct_answer: Number(questionData.correctAnswer),
          explanation: formattedExplanation,
          created_by: userId
        }
      ])
      .select()
      .single();

    if (error) throw error;

    appendQuestion({
      subject: questionData.subject,
      chapter: questionData.chapter || 'All',
      question: formattedQuestion,
      options: formattedOptions,
      correctAnswer: Number(questionData.correctAnswer),
      explanation: formattedExplanation
    });

    return { data, error: null };
  } catch (err) {
    console.error('Error adding custom question to DB:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Universal fetcher used by BOTH Personal Practice Tests and Friend Circle Tests.
 */
export async function fetchQuestionsForTest(subject = 'Physics', chapter = 'All', count = 5, exam = 'JEE Main') {
  const normalizedExam = normalizeExam(exam);
  try {
    let query = supabase.from('custom_questions').select('*').eq('exam', normalizedExam);
    if (subject && subject !== 'Full Syllabus' && subject !== 'All') query = query.eq('subject', subject);
    if (chapter && chapter !== 'All') query = query.eq('chapter', chapter);

    const { data: dbQuestions, error } = await query;
    let pool = [];
    if (!error && Array.isArray(dbQuestions)) {
      pool = dbQuestions.map((q, idx) => ({
        id: idx + 1, question: formatMathSymbols(q.question),
        options: Array.isArray(q.options) ? q.options.map(formatMathSymbols) : [],
        correctAnswer: q.correct_answer, explanation: formatMathSymbols(q.explanation || ''),
        subject: q.subject, chapter: q.chapter, yearTag: q.year_tag || q.yearTag
      }));
    }
    const selected = pool.sort(() => 0.5 - Math.random()).slice(0, count);
    if (selected.length < count) {
      const needed = count - selected.length;
      const fallback = normalizedExam === 'NEET'
        ? getStandardNEETQuestions(subject === 'Full Syllabus' ? 'All' : subject, chapter, needed)
        : getStandardQuestions(subject === 'Full Syllabus' ? 'Physics' : subject, chapter, needed);
      selected.push(...fallback);
    }
    return selected.slice(0, count);
  } catch (err) {
    console.error('Error fetching questions:', err);
    return normalizedExam === 'NEET'
      ? getStandardNEETQuestions(subject === 'Full Syllabus' ? 'All' : subject, chapter, count)
      : getStandardQuestions(subject === 'Full Syllabus' ? 'Physics' : subject, chapter, count);
  }
}
