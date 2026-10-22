import { supabase } from './supabaseClient';
import { formatMathSymbols } from '../data/jeeQuestionBank';
import { normalizeExam } from '../config/examConfig';

const NUMERIC_TYPES = new Set(['NUM', 'INTEGER', 'NUMERICAL', 'NAT', 'INT']);

const asText = (value) => value === null || value === undefined ? '' : String(value).trim();

function normalizeQuestion(raw, fallbackExam, userId) {
  const question = asText(raw.question ?? raw.question_text ?? raw.text ?? raw.prompt);
  if (!question) throw new Error('Every question needs a non-empty question field.');

  const examInput = asText(raw.exam || fallbackExam || 'JEE Main');
  const exam = normalizeExam(examInput);
  const databaseExam = exam === 'JEE' ? 'JEE Main' : exam;
  if (!['JEE Main', 'JEE Advanced', 'NEET'].includes(databaseExam)) {
    throw new Error(`Unsupported exam "${examInput}". Use JEE Main, JEE Advanced, or NEET.`);
  }

  const subject = asText(raw.subject);
  if (!subject) throw new Error('Every question needs a subject.');

  const typeInput = asText(raw.question_type || raw.questionType || raw.type || 'MCQ').toUpperCase();
  const isNumeric = NUMERIC_TYPES.has(typeInput);
  if (!isNumeric && !['MCQ', 'MULTIPLE_CHOICE', 'SINGLE_CORRECT'].includes(typeInput)) {
    throw new Error(`Unsupported question_type "${typeInput}". Use MCQ or INTEGER.`);
  }
  const questionType = isNumeric ? 'INTEGER' : 'MCQ';
  const options = Array.isArray(raw.options)
    ? raw.options.map((option) => asText(typeof option === 'object' && option !== null
      ? (option.text ?? option.value ?? option.label ?? '')
      : option))
    : [];

  let correctAnswer = raw.correct_answer ?? raw.correctAnswer ?? raw.correctIndex ?? raw.answerIndex;
  let correctAnswerText = asText(raw.correct_answer_text ?? raw.correctAnswerText ?? (isNumeric ? raw.answer : ''));

  if (isNumeric) {
    const numericAnswer = correctAnswerText || asText(correctAnswer);
    if (!numericAnswer || !Number.isFinite(Number(numericAnswer))) {
      throw new Error('Integer/numerical questions need a numeric correct_answer or correct_answer_text.');
    }
    correctAnswerText = numericAnswer;
    const parsed = Number(numericAnswer);
    if (Number.isInteger(parsed)) correctAnswer = parsed;
    else correctAnswer = 0; // The legacy schema requires an integer; exact value is preserved in correct_answer_text.
  } else {
    if (typeof correctAnswer === 'string' && /^[A-D]$/i.test(correctAnswer.trim())) {
      correctAnswer = correctAnswer.trim().toUpperCase().charCodeAt(0) - 65;
    } else {
      correctAnswer = Number(correctAnswer);
    }
    if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
      throw new Error('MCQ correct_answer must be an option index (0–3) or letter A–D.');
    }
    if (options.length !== 4 || options.some((option) => !option)) {
      throw new Error('Every MCQ must include exactly four non-empty options.');
    }
    if (correctAnswer >= options.length) throw new Error('MCQ correct_answer points to a missing option.');
  }

  return {
    subject,
    chapter: asText(raw.chapter || raw.chapterId) || 'All',
    exam: databaseExam,
    year_tag: asText(raw.year_tag || raw.yearTag || raw.year || '') || null,
    question: formatMathSymbols(question),
    options: options.map(formatMathSymbols),
    question_type: questionType,
    correct_answer: correctAnswer,
    correct_answer_text: correctAnswerText || null,
    explanation: formatMathSymbols(asText(raw.explanation || raw.solution || '')),
    source_id: asText(raw.source_id || raw.sourceId || '') || null,
    created_by: userId || null
  };
}

const dedupeKey = (row) => [
  row.exam.toLowerCase(),
  (row.year_tag || '').toLowerCase(),
  row.subject.toLowerCase(),
  row.question.replace(/\s+/g, ' ').trim().toLowerCase()
].join('::');

/**
 * Imports validated question objects into the existing custom_questions table.
 * JSON may be an array, { questions: [...] }, or { data: [...] }.
 */
export async function importQuestionsFromJSON(input, { exam = 'JEE Main', userId } = {}) {
  let parsed;
  try {
    parsed = typeof input === 'string' ? JSON.parse(input) : input;
  } catch {
    throw new Error('That is not valid JSON. Check commas, quotation marks, and brackets.');
  }

  const rawQuestions = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.questions)
      ? parsed.questions
      : Array.isArray(parsed?.data)
        ? parsed.data
        : null;

  if (!rawQuestions?.length) {
    throw new Error('Provide a non-empty JSON array, or an object containing a questions array.');
  }
  if (rawQuestions.length > 500) {
    throw new Error('Import is limited to 500 questions per batch. Split the file into smaller batches.');
  }

  const rows = rawQuestions.map((raw, index) => {
    try {
      return normalizeQuestion(raw, exam, userId);
    } catch (error) {
      throw new Error(`Question ${index + 1}: ${error.message}`);
    }
  });

  // Check duplicates within the upload first.
  const seen = new Set();
  const uniqueRows = [];
  let duplicatesSkipped = 0;
  for (const row of rows) {
    const key = dedupeKey(row);
    if (seen.has(key)) {
      duplicatesSkipped += 1;
      continue;
    }
    seen.add(key);
    uniqueRows.push(row);
  }

  // Compare against existing rows for the same exam/year so repeated imports are safe.
  const existingKeys = new Set();
  const groups = new Map();
  for (const row of uniqueRows) {
    const groupKey = `${row.exam}::${row.year_tag || ''}`;
    if (!groups.has(groupKey)) groups.set(groupKey, row);
  }
  for (const row of groups.values()) {
    let query = supabase.from('custom_questions').select('question, exam, year_tag, subject')
      .eq('exam', row.exam);
    if (row.year_tag) query = query.eq('year_tag', row.year_tag);
    else query = query.is('year_tag', null);
    const { data, error } = await query;
    if (error) throw new Error(`Could not check for existing questions: ${error.message}`);
    for (const existing of data || []) existingKeys.add(dedupeKey(existing));
  }

  const toInsert = uniqueRows.filter((row) => {
    const key = dedupeKey(row);
    if (existingKeys.has(key)) {
      duplicatesSkipped += 1;
      return false;
    }
    existingKeys.add(key);
    return true;
  });

  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += 100) {
    const batch = toInsert.slice(i, i + 100);
    const { error } = await supabase.from('custom_questions').insert(batch);
    if (error) throw new Error(`Import stopped after ${inserted} inserted question(s): ${error.message}`);
    inserted += batch.length;
  }

  return { received: rows.length, inserted, duplicatesSkipped };
}
