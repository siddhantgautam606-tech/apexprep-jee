import React, { useState } from 'react';
import { X, Mail, Lock, User, Target, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import {
  signUpUser,
  signInUser,
  sendPasswordResetEmail,
  verifyPasswordResetOtp,
  updatePassword,
} from '../../services/authService';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [targetExam, setTargetExam] = useState('JEE Main');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  if (!isOpen) return null;

  const goTo = (nextMode) => {
    setMode(nextMode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const startCooldown = () => {
    setOtpCooldown(60);
    const timer = setInterval(() => {
      setOtpCooldown((seconds) => {
        if (seconds <= 1) {
          clearInterval(timer);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'forgot') {
        if (!email.trim()) throw new Error('Please enter your email address.');

        const result = await sendPasswordResetEmail(email);
        if (result?.error) throw new Error(result.error);

        setOtpSent(true);
        setMode('verify-otp');
        setSuccessMsg('If an account exists for this email, a 6-digit OTP has been sent. Check your inbox.');
        startCooldown();
      } else if (mode === 'verify-otp') {
        if (!/^\d{6}$/.test(otp.trim())) {
          throw new Error('Please enter the 6-digit OTP from your email.');
        }

        const result = await verifyPasswordResetOtp(email, otp);
        if (result?.error) throw new Error(result.error);

        setMode('update-password');
        setOtp('');
        setSuccessMsg('OTP verified. Create your new password below.');
      } else if (mode === 'update-password') {
        if (newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('New password and confirmation do not match.');
        }

        const result = await updatePassword(newPassword);
        if (result?.error) throw new Error(result.error);

        setSuccessMsg('Password updated successfully. You can now log in.');
        setMode('login');
        setNewPassword('');
        setConfirmPassword('');
        setPassword('');
        setOtpSent(false);
      } else if (mode === 'signup') {
        if (!username.trim()) throw new Error('Please enter a username.');

        const result = await signUpUser(email, password, {
          username,
          target_exam: targetExam,
        });

        if (result?.error) throw new Error(result.error);
        if (result?.data) onAuthSuccess(result.data);
        onClose();
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

  const handleResend = async () => {
    if (otpCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await sendPasswordResetEmail(email);
      if (result?.error) throw new Error(result.error);

      setSuccessMsg('A new OTP has been sent to your email.');
      startCooldown();
    } catch (err) {
      setErrorMsg(err.message || 'Could not resend the OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const isRecovery = ['forgot', 'verify-otp', 'update-password'].includes(mode);
  const isSignup = mode === 'signup';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:text-white">
        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {isRecovery && (
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
                : mode === 'verify-otp'
                  ? 'Verify OTP'
                  : mode === 'update-password'
                    ? 'Set New Password'
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
          {mode === 'forgot' && (
            <>
              <p className="text-sm text-slate-500">
                Enter your registered email. We will send a 6-digit recovery OTP.
              </p>
              <EmailField email={email} setEmail={setEmail} />
              <SubmitButton loading={loading} label="Send OTP" />
            </>
          )}

          {mode === 'verify-otp' && (
            <>
              <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30">
                <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Enter the 6-digit code sent to <strong>{email}</strong>.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                  Verification Code
                </label>
                <div className="relative flex items-center">
                  <ShieldCheck className="absolute left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    autoFocus
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-center text-lg tracking-[0.35em] focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <SubmitButton loading={loading} label="Verify OTP" />

              <div className="text-center text-sm text-slate-500">
                Didn't receive it?{' '}
                <button
                  type="button"
                  disabled={otpCooldown > 0 || resendLoading}
                  onClick={handleResend}
                  className="font-semibold text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400"
                >
                  {resendLoading
                    ? 'Sending...'
                    : otpCooldown > 0
                      ? `Resend in ${otpCooldown}s`
                      : 'Resend OTP'}
                </button>
              </div>
            </>
          )}

          {mode === 'update-password' && (
            <>
              <p className="text-sm text-slate-500">
                OTP verified. Choose a new password for your PrepXAI account.
              </p>
              <PasswordField
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
              />
              <PasswordField
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
              <SubmitButton loading={loading} label="Update Password" />
            </>
          )}

          {!isRecovery && (
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

        {!isRecovery && (
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
        )}
      </div>
    </div>
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
