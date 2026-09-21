import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import PasswordInput from '../components/PasswordInput';
import { apiRequest } from '../api';
import { INPUT_CLASSES } from '../styles';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setStatus('error');
      setError('Passwords do not match.');
      return;
    }

    setStatus('submitting');
    try {
      await apiRequest('/signup/reset-password', { method: 'POST', body: { token, password } });
      setStatus('success');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (!token) {
    return (
      <PageShell eyebrow="Reset Password" title="Missing reset token" subtitle="This link looks incomplete.">
        <p className="text-white/60 text-sm">
          Request a new reset link from the{' '}
          <Link to="/forgot-password" className="text-[#e8702a] hover:underline">
            forgot password page
          </Link>
          .
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Reset Password"
      title="Choose a new password"
      subtitle="This link is valid for a limited time and can only be used once."
    >
      <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-10">
        {status === 'success' ? (
          <div className="text-center py-4">
            <p className="text-emerald-400 text-sm font-medium">Password updated.</p>
            <p className="text-white/60 text-sm mt-2">Redirecting you to log in…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-xs text-white/60 mb-1.5 block" htmlFor="password">New Password</label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className={INPUT_CLASSES}
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1.5 block" htmlFor="confirmPassword">Confirm New Password</label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                minLength={6}
                className={INPUT_CLASSES}
              />
            </div>

            {status === 'error' && error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="mt-1 bg-[#e8702a] hover:bg-[#d2611f] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-7 py-3.5 rounded-full transition-all hover:scale-[1.02] active:scale-95"
            >
              {status === 'submitting' ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </PageShell>
  );
};

export default ResetPassword;
