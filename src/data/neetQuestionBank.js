import { formatMathSymbols } from './jeeQuestionBank';

// Question content intentionally cleared. Keep the public API stable so the app
// remains functional while the question bank is repopulated.
export const NEET_QUESTION_BANK = {
  Physics: [],
  Chemistry: [],
  Biology: []
};

export function getStandardNEETQuestions(_subject = 'Physics', _chapter = 'All', _count = 5) {
  return [];
}

// Preserve the import-side dependency used by existing consumers and tooling.
void formatMathSymbols;
