import React, { useState } from 'react';
import { X, Mail, Lock, User, Target, Loader2 } from 'lucide-react';
import { signUpUser, signInUser } from '../../services/authService';

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
        await signUpUser(email, password, { username, targetExam });
      } else {
        await signInUser(email, password);
      }
      onAuthSuccess();
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
            {isSignUp ? 'Create ApexPrep Account' : 'Welcome Back'}
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