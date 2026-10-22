import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, FileJson, LoaderCircle, X } from 'lucide-react';
import { importQuestionsFromJSON } from '../../services/questionImportService';

const SAMPLE = JSON.stringify({
  questions: [{
    exam: 'JEE Main',
    year_tag: 'JEE Main 2026 · 02 April · Morning',
    subject: 'Mathematics',
    chapter: 'Matrices and Determinants',
    question_type: 'MCQ',
    question: 'If A = [[1, 2], [3, 4]], find det(A).',
    options: ['-2', '2', '10', '-10'],
    correct_answer: 0,
    explanation: 'For a 2×2 matrix, det(A) = ad − bc = 4 − 6 = −2.'
  }]
}, null, 2);

export default function QuestionImporter({ exam, userId, onClose, onImported }) {
  const [jsonText, setJsonText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const preview = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonText);
      const items = Array.isArray(parsed) ? parsed : parsed?.questions || parsed?.data;
      return Array.isArray(items) ? { count: items.length, validJson: true } : { count: 0, validJson: true };
    } catch {
      return { count: 0, validJson: false };
    }
  }, [jsonText]);

  const runImport = async () => {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const summary = await importQuestionsFromJSON(jsonText, { exam, userId });
      setResult(summary);
      onImported?.();
    } catch (err) {
      setError(err?.message || 'Import failed. Please check the JSON and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/75 flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300"><FileJson className="w-5 h-5" /><h3 className="text-base font-bold text-white">Import question bank</h3></div>
            <p className="text-xs text-slate-400 mt-1">Import structured JSON into the existing Supabase question table.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close importer" className="p-1 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-300 leading-relaxed mb-4">
          <strong className="text-white">Accepted input:</strong> a JSON array, or an object with a <code>questions</code> array. Each item needs question, subject, and answer data. MCQs need four options and a correct option index (0–3) or letter (A–D). Integer/numerical items use <code>question_type: "INTEGER"</code> and <code>correct_answer_text</code>.
          <button type="button" onClick={() => setJsonText(SAMPLE)} className="block mt-2 text-indigo-300 hover:text-indigo-200 font-semibold">Load sample JSON</button>
        </div>

        <label className="block text-xs font-semibold text-slate-300 mb-2" htmlFor="question-json">Question JSON</label>
        <textarea id="question-json" value={jsonText} onChange={(e) => { setJsonText(e.target.value); setError(''); setResult(null); }} rows={14} spellCheck={false} placeholder="Paste your authorized/original question JSON here…" className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-xs leading-relaxed text-slate-200 focus:outline-none focus:border-indigo-500" />

        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs text-slate-400">
          <span>{preview.validJson ? `${preview.count} question(s) detected` : jsonText.trim() ? 'JSON syntax needs checking' : 'Paste JSON to preview the import count'}</span>
          <span>Maximum 500 questions per batch · Duplicate questions are skipped</span>
        </div>

        {error && <div role="alert" className="mt-4 flex gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
        {result && <div role="status" className="mt-4 flex gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200"><CheckCircle2 className="w-4 h-4 shrink-0" /><span>Import complete: {result.inserted} added, {result.duplicatesSkipped} duplicate(s) skipped, {result.received} received.</span></div>}

        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-800">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700">Close</button>
          <button type="button" onClick={runImport} disabled={busy || !preview.validJson || preview.count === 0 || !jsonText.trim()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed">
            {busy ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <FileJson className="w-4 h-4" />}{busy ? 'Importing…' : 'Validate & Import'}
          </button>
        </div>
      </div>
    </div>
  );
}
