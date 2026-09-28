import React, { useEffect, useState } from 'react';
import { X, Mail, Lock, User, Target, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import {
  signUpUser,
  signInUser,
  getCurrentUser,
  completeOnboarding,
  sendPasswordResetEmail,
  updatePassword,
  redeemAppLoginCode,
} from '../../services/authService';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [targetExam, setTargetExam] = useState('JEE Main');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const isNativeAndroid = typeof window !== 'undefined' && window.Capacitor?.getPlatform?.() === 'android';

  if (!isOpen) return null;

  const goTo = (nextMode) => {
    setMode(nextMode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'pair') {
        if (!/^[A-Za-z0-9]{8}$/.test(pairingCode.trim())) {
          throw new Error('Enter the 8-character code shown on the website.');
        }
        const result = await redeemAppLoginCode(pairingCode.trim());
        if (result?.error) throw new Error(result.error);
        if (!result?.data) throw new Error('App login could not be completed.');
        onAuthSuccess(result.data);
        onClose();
      } else if (mode === 'reset') {
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        const result = await updatePassword(password);
        if (result?.error) throw new Error(result.error);
        const { getCurrentUser } = await import('../../services/authService');
        const user = await getCurrentUser();
        if (!user) throw new Error('Password updated. Please sign in again.');
        onAuthSuccess(user);
        onClose();
      } else if (mode === 'forgot') {
        if (!email.trim()) throw new Error('Please enter your email address.');

        const result = await sendPasswordResetEmail(email);
        if (result?.error) throw new Error(result.error);

        setMode('recovery-sent');
        setSuccessMsg('');
      } else if (mode === 'signup') {
        if (!username.trim()) throw new Error('Please enter a username.');

        const result = await signUpUser(email, password, {
          username,
          target_exam: targetExam,
        });

        if (result?.error) throw new Error(result.error);
        if (result?.data?.session) {
          let user = await getCurrentUser();
          if (user?.needsOnboarding) {
            const completion = await completeOnboarding({ username, target_exam: targetExam });
            if (completion?.error) throw new Error(completion.error);
            user = completion.data;
          }
          if (!user) throw new Error('Your account was created, but the profile could not be loaded. Please log in.');
          onAuthSuccess(user);
          onClose();
        } else {
          setMode('signup-confirmation');
          setSuccessMsg('');
        }
      } else {
        const result = await signInUser(email, password);
        if (result?.error) throw new Error(result.error);
        if (!result?.data) {
          throw new Error('Login succeeded but your profile could not be loaded.');
        }

        onAuthSuccess(result.data);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const isRecovery = ['forgot', 'recovery-sent', 'reset', 'signup-confirmation'].includes(mode);
  const isPairing = mode === 'pair';
  const isSignup = mode === 'signup';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:text-white">
        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {(isRecovery || isPairing) && (
              <button
                type="button"
                onClick={() => goTo('login')}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5 text-slate-500" />
              </button>
            )}
            <h2 className="text-xl font-bold">
              {mode === 'forgot'
                ? 'Forgot Password'
                : mode === 'recovery-sent'
                  ? 'Check Your Email'
                  : mode === 'signup-confirmation'
                    ? 'Confirm Email'
                    : mode === 'reset'
                      ? 'Create New Password'
                  : isPairing
                    ? 'Use Website Login'
                  : isSignup
                      ? 'Create PrepXAI Account'
                      : 'Welcome Back'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950/40 dark:text-green-400">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === 'pair' && (
            <>
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Already logged in on the PrepXAI website?</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  On the website, open <strong>Connect App</strong> and enter the one-time code below.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Website Login Code</label>
                <input
                  type="text"
                  inputMode="text"
                  autoCapitalize="characters"
                  autoComplete="one-time-code"
                  maxLength={8}
                  required
                  placeholder="ABCD2345"
                  value={pairingCode}
                  onChange={(e) => setPairingCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center font-mono text-lg font-bold tracking-[0.18em] focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <SubmitButton loading={loading} label="Log In to APK" />
            </>
          )}

          {mode === 'reset' && (
            <>
              <p className="text-sm text-slate-500">Choose a new password for your PrepXAI account.</p>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">New Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-4 w-4 text-slate-400" />
                  <input type="password" required minLength={6} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800" />
                </div>
              </div>
              <SubmitButton loading={loading} label="Update Password" />
            </>
          )}

          {mode === 'forgot' && (
            <>
              <p className="text-sm text-slate-500">
                Enter your registered email and we'll send you a secure login link.
              </p>
              <EmailField email={email} setEmail={setEmail} />
              <SubmitButton loading={loading} label="Send Login Link" />
            </>
          )}

          {mode === 'signup-confirmation' && (
            <div className="space-y-5">
              <div className="rounded-xl bg-blue-50 p-5 text-center dark:bg-blue-950/30">
                <Mail className="mx-auto mb-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Confirm your email</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  If this email is eligible for a new account, check <strong>{email}</strong> for a confirmation message and follow its instructions before logging in.
                </p>
              </div>
              <button
                type="button"
                onClick={() => goTo('login')}
                className="w-full rounded-lg border border-slate-300 py-2.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Back to Login
              </button>
            </div>
          )}

          {mode === 'recovery-sent' && (
            <div className="space-y-5">
              <div className="rounded-xl bg-blue-50 p-5 text-center dark:bg-blue-950/30">
                <Mail className="mx-auto mb-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Login link has been sent
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  We sent a secure login link to <strong>{email}</strong>.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Open your email on this device and tap the link to continue.
                </p>
              </div>

              <button
                type="button"
                onClick={() => goTo('login')}
                className="w-full rounded-lg border border-slate-300 py-2.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Back to Login
              </button>
            </div>
          )}

          {!isRecovery && !isPairing && (
            <>
              {isSignup && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                      Username
                    </label>
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
                    <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                      Target Exam
                    </label>
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

              {isNativeAndroid && mode === 'login' && (
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-50 p-3 text-sm text-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-200">
                  Sign in with the same email and password you use on the PrepXAI website.
                </div>
              )}
              <EmailField email={email} setEmail={setEmail} />

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase text-slate-500">
                    Password
                  </label>
                  {!isSignup && (
                    <button
                      type="button"
                      onClick={() => goTo('forgot')}
                      className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
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

              <SubmitButton loading={loading} label={isSignup ? 'Create Account' : 'Log In'} />
            </>
          )}
        </form>

        {!isRecovery && !isPairing && (
          <>
          <div className="mt-4 text-center text-sm text-slate-500">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => goTo(isSignup ? 'login' : 'signup')}
              className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              {isSignup ? 'Log in' : 'Sign up'}
            </button>
          </div>
          {isNativeAndroid && mode === 'login' && (
            <button
              type="button"
              onClick={() => goTo('pair')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/20"
            >
              <LinkIcon /> Continue with Website
            </button>
          )}
          <div className="mt-4 text-center text-[11px] leading-5 text-slate-500">
            By continuing, you agree to our{' '}
            <a href="/terms" className="font-semibold text-slate-400 hover:text-indigo-300 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="font-semibold text-slate-400 hover:text-indigo-300 hover:underline">Privacy Policy</a>.
          </div>
          </>
        )}
      </div>
    </div>
  );
}

function LinkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-current stroke-2">
      <path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" />
      <path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 7 20l1.15-1.15" />
    </svg>
  );
}



function EmailField({ email, setEmail }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
        Email Address
      </label>
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
  );
}

function PasswordField({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
        {label}
      </label>
      <div className="relative flex items-center">
        <Lock className="absolute left-3 h-4 w-4 text-slate-400" />
        <input
          type="password"
          required
          minLength={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800"
        />
      </div>
    </div>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}
