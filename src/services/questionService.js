import { supabase } from './supabaseClient';
import { getStandardQuestions, formatMathSymbols } from '../data/jeeQuestionBank';
import { QUESTIONS_POOL } from '../data/questionsPool';

/**
 * Returns all available subjects
 */
export function getAllSubjects() {
  return ['Physics', 'Chemistry', 'Mathematics'];
}

/**
 * Filters questions for QuestionPool.jsx
 */
export function getFilteredQuestions({ subject, chapter, difficulty, search } = {}) {
  let list = Array.isArray(QUESTIONS_POOL) ? [...QUESTIONS_POOL] : [];

  if (subject && subject !== 'All') {
    list = list.filter((q) => q.subject?.toLowerCase() === subject.toLowerCase());
  }
  if (chapter && chapter !== 'All') {
    list = list.filter((q) => q.chapter?.toLowerCase() === chapter.toLowerCase());
  }
  if (difficulty && difficulty !== 'All') {
    list = list.filter((q) => q.difficulty?.toLowerCase() === difficulty.toLowerCase());
  }
  if (search && search.trim()) {
    const s = search.toLowerCase();
    list = list.filter(
      (q) =>
        q.question?.toLowerCase().includes(s) ||
        q.chapter?.toLowerCase().includes(s) ||
        q.subject?.toLowerCase().includes(s)
    );
  }

  return list.map((q) => ({
    ...q,
    question: formatMathSymbols(q.question),
    options: Array.isArray(q.options) ? q.options.map((opt) => formatMathSymbols(opt)) : [],
    explanation: formatMathSymbols(q.explanation || '')
  }));
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
export async function fetchQuestionsForTest(subject = 'Physics', chapter = 'All', count = 5) {
  try {
    let query = supabase.from('custom_questions').select('*');

    if (subject && subject !== 'Full Syllabus') {
      query = query.eq('subject', subject);
    }
    if (chapter && chapter !== 'All') {
      query = query.eq('chapter', chapter);
    }

    const { data: dbQuestions, error } = await query;
    let pool = [];

    if (!error && Array.isArray(dbQuestions) && dbQuestions.length > 0) {
      pool = dbQuestions.map((q, idx) => ({
        id: idx + 1,
        question: formatMathSymbols(q.question),
        options: Array.isArray(q.options)
          ? q.options.map((opt) => formatMathSymbols(opt))
          : [],
        correctAnswer: q.correct_answer,
        explanation: formatMathSymbols(q.explanation || ''),
        subject: q.subject,
        chapter: q.chapter
      }));
    }

    const shuffled = pool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    if (selected.length < count) {
      const needed = count - selected.length;
      const fallbackQuestions = getStandardQuestions(
        subject === 'Full Syllabus' ? 'Physics' : subject,
        chapter,
        needed
      );
      selected.push(...fallbackQuestions);
    }

    return selected.slice(0, count);
  } catch (err) {
    console.error('Error fetching from custom pool, using fallback:', err);
    return getStandardQuestions(
      subject === 'Full Syllabus' ? 'Physics' : subject,
      chapter,
      count
    );
  }
}