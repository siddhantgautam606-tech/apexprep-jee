import React, { useState } from 'react';
import { Target, User, Loader2, LogOut } from 'lucide-react';
import { completeOnboarding, signOutUser } from '../../services/authService';

export default function OnboardingModal({ currentUser, onComplete }) {
  const [username, setUsername] = useState('');
  const [targetExam, setTargetExam] = useState('JEE Main');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const result = await completeOnboarding({
      username,
      target_exam: targetExam,
    });

    if (result?.error) {
      setErrorMsg(result.error);
      setLoading(false);
      return;
    }

    onComplete(result.data);
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOutUser();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-indigo-500/20 bg-slate-900 p-7 shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-600/20">
          <User className="h-7 w-7 text-white" />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-black text-white">Welcome to PrepXAI</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            One last step — choose your nickname and tell us which exam you are preparing for.
          </p>
          {currentUser?.email && (
            <p className="mt-2 truncate text-xs text-slate-500">{currentUser.email}</p>
          )}
        </div>

        {errorMsg && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-950/30 p-3 text-sm text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">
              Nickname
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                required
                minLength={3}
                maxLength={24}
                pattern="[A-Za-z0-9_]+"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="e.g. topper_2027"
                autoComplete="username"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-3 text-sm text-white outline-none transition focus:border-indigo-500"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">3–24 characters: letters, numbers, or underscores.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">
              Target Exam
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <select
                value={targetExam}
                onChange={(event) => setTargetExam(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-3 text-sm text-white outline-none transition focus:border-indigo-500"
              >
                <option value="JEE Main">JEE Main</option>
                <option value="JEE Advanced">JEE Advanced</option>
                <option value="NEET">NEET</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue to PrepXAI
          </button>
        </form>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-500 transition hover:text-slate-300"
        >
          <LogOut className="h-3.5 w-3.5" />
          Use a different account
        </button>
      </div>
    </div>
  );
}
