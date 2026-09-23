import * as MathHelper from '../../data/jeeQuestionBank';

const safeFormatMath = (value) => {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'string' ? value : typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (typeof MathHelper.formatMathSymbols === 'function') {
    try { return MathHelper.formatMathSymbols(str); } catch { return str; }
  }
  return str;
};

export default function QuestionCard({ question, index }) {
  if (!question) return null;

  const qData = question.data || question.payload || question;

  const rawPrompt =
    qData.question || qData.question_text || qData.questionText || qData.statement ||
    qData.problem || qData.prompt || qData.body || qData.text || qData.title ||
    qData.q || qData.qText || question.question || question.question_text ||
    question.statement || '';

  const promptText = safeFormatMath(rawPrompt);

  const rawOptions = qData.options || qData.choices || qData.answers || question.options || question.choices || [];
  let options = [];

  if (Array.isArray(rawOptions)) {
    options = rawOptions.map((opt) => {
      if (typeof opt === 'string' || typeof opt === 'number') return safeFormatMath(opt);
      if (opt && typeof opt === 'object') return safeFormatMath(opt.text || opt.option || opt.label || opt.value || JSON.stringify(opt));
      return String(opt);
    });
  } else if (rawOptions && typeof rawOptions === 'object') {
    options = Object.entries(rawOptions).map(([key, val]) => {
      const valText = typeof val === 'object' ? (val.text || val.value || JSON.stringify(val)) : val;
      return `${key}: ${safeFormatMath(valText)}`;
    });
  }

  const correctRaw =
    qData.correctAnswer !== undefined ? qData.correctAnswer :
    qData.correct_answer !== undefined ? qData.correct_answer :
    qData.answer !== undefined ? qData.answer :
    question.correctAnswer || question.correct_answer || question.answer;

  const getIsCorrect = (optIdx, optValue) => {
    if (correctRaw === undefined || correctRaw === null) return false;
    if (Number(correctRaw) === optIdx) return true;
    if (typeof correctRaw === 'string') {
      const trimmed = correctRaw.trim().toUpperCase();
      if (trimmed === String.fromCharCode(65 + optIdx)) return true;
      if (typeof optValue === 'string' && optValue.startsWith(`${trimmed}:`)) return true;
      if (typeof optValue === 'string' && optValue.trim() === correctRaw.trim()) return true;
    }
    return false;
  };

  const explanationRaw = qData.explanation || qData.solution || question.explanation || question.solution || '';
  const explanation = safeFormatMath(explanationRaw);
  const subject = qData.subject || question.subject;
  const chapter = qData.chapter || question.chapter;
  const difficulty = qData.difficulty || question.difficulty;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 shadow-sm hover:border-slate-700 transition">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 shrink-0">
            Q{index !== undefined ? index + 1 : question.id || '•'}
          </span>
          {subject && (
            <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
              {subject}
            </span>
          )}
          {chapter && chapter !== 'All' && (
            <span className="text-[10px] text-slate-400 truncate">{chapter}</span>
          )}
        </div>

        {difficulty && (
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
            String(difficulty).toLowerCase() === 'easy'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : String(difficulty).toLowerCase() === 'hard'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            {difficulty}
          </span>
        )}
      </div>

      <div className="text-xs font-medium text-slate-100 leading-snug whitespace-pre-wrap">
        {promptText || <span className="text-amber-400/80 italic text-[10px]">Prompt unavailable</span>}
      </div>

      {options.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5">
          {options.map((opt, optIdx) => {
            const isCorrect = getIsCorrect(optIdx, opt);
            return (
              <div
                key={optIdx}
                className={`px-2 py-1.5 rounded-lg border text-[10px] flex items-center gap-1.5 min-w-0 ${
                  isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 border ${
                  isCorrect
                    ? 'bg-emerald-500 border-emerald-400 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}>
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="flex-1 min-w-0">{opt}</span>
                {isCorrect && (
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded border border-emerald-500/30 shrink-0">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {explanation && (
        <details className="bg-slate-950/80 border border-slate-800/80 rounded-lg text-[10px] text-slate-400">
          <summary className="cursor-pointer px-2.5 py-1.5 text-slate-300 font-semibold">View explanation</summary>
          <div className="px-2.5 pb-2">{explanation}</div>
        </details>
      )}
    </div>
  );
}