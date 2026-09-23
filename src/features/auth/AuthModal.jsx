import React, { useState } from 'react';
import { X, Mail, Lock, User, Target, Loader2 } from 'lucide-react';
import { signUpUser, signInUser, signInWithGoogle } from '../../services/authService';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [targetExam, setTargetExam] = useState('JEE Main');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (isSignUp) {
        if (!username.trim()) throw new Error('Please enter a username.');
        const result = await signUpUser(email, password, { username, target_exam: targetExam });
        if (result?.error) throw new Error(result.error);
        onAuthSuccess(result?.data || null);
      } else {
        const result = await signInUser(email, password);
        if (result?.error) throw new Error(result.error);
        if (!result?.data) throw new Error('Login succeeded but the user profile could not be loaded. Please try again.');
        onAuthSuccess(result.data);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:text-white">
        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <h2 className="text-xl font-bold">
            {isSignUp ? 'Create PrepXAI Account' : 'Welcome Back'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        {errorMsg && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {errorMsg}
          </div>
        )}
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            setErrorMsg('');
            const result = await signInWithGoogle();
            if (result?.error) {
              setErrorMsg(result.error);
              setLoading(false);
            }
          }}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white py-2.5 font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.22Z"/>
            <path fill="#34A853" d="M12 21.9c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0 4.69-1.72 5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.9Z"/>
            <path fill="#FBBC05" d="M6.54 14c-.2-.58-.31-1.2-.31-1.83s.11-1.25.31-1.83V7.81H3.3A9.78 9.78 0 0 0 2.25 12c0 1.58.38 3.07 1.05 4.19L6.54 14Z"/>
            <path fill="#EA4335" d="M12 6.31c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.33 14.63 2.1 12 2.1a9.74 9.74 0 0 0-8.7 5.71L6.54 10.34C7.31 8.03 9.46 6.31 12 6.31Z"/>
          </svg>
          Continue with Google
        </button>
        <div className="my-3 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span>OR</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Username</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="topper_2027"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Target Exam</label>
                <div className="relative flex items-center">
                  <Target className="absolute left-3 h-4 w-4 text-slate-400" />
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="JEE Main">JEE Main</option>
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="NEET">NEET</option>
                  </select>
                </div>
              </div>
            </>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="aspirant@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSignUp ? 'Create Account' : 'Log In'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-slate-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            {isSignUp ? 'Log in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}