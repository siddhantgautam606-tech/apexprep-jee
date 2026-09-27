import React, { useEffect, useState } from 'react';
import { Check, Copy, Link2, Loader2, RefreshCw, X } from 'lucide-react';
import { createAppLoginPairing } from '../../services/authService';

export default function AppPairingModal({ isOpen, onClose }) {
  const [code, setCode] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const generate = async () => {
    setLoading(true);
    setErrorMsg('');
    setCopied(false);
    const result = await createAppLoginPairing();
    if (result?.error) {
      setErrorMsg(result.error);
      setCode('');
      setExpiresAt(null);
    } else {
      setCode(result.code);
      setExpiresAt(Date.now() + Number(result.expiresInSeconds || 600) * 1000);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    generate();
  }, [isOpen]);

  if (!isOpen) return null;

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setErrorMsg('Copy failed. You can type the code manually.');
    }
  };

  const remaining = expiresAt ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)) : 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-indigo-500/30 bg-slate-900 p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[11px] font-bold text-indigo-300">
              <Link2 className="h-3.5 w-3.5" /> Connect Android App
            </div>
            <h2 className="text-xl font-black">Log the APK in with this account</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Open PrepXAI on your phone, choose <span className="font-semibold text-slate-200">Use Website Login</span>, and enter this one-time code.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && <div className="mt-4 rounded-xl border border-red-500/20 bg-red-950/30 p-3 text-sm text-red-300">{errorMsg}</div>}

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">One-time login code</p>
          <div className="mt-3 min-h-14 flex items-center justify-center">
            {loading ? (
              <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
            ) : (
              <span className="font-mono text-3xl font-black tracking-[0.22em] text-white">{code || '--------'}</span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <button type="button" onClick={copyCode} disabled={!code} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-40">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button type="button" onClick={generate} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-40">
              <RefreshCw className="h-4 w-4" /> New code
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {code ? ('Expires in ' + minutes + ':' + seconds) : 'Generate a code to continue.'}
          </p>
        </div>

        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
          The code is short-lived and can only be used once.
        </p>
      </div>
    </div>
  );
}
