import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { apiRequest } from '../api';
import { INPUT_CLASSES } from '../styles';

type SubmitStatus = 'idle' | 'submitting' | 'sent' | 'error';

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  devResetUrl?: string;
}

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      const data = await apiRequest<ForgotPasswordResponse>('/signup/forgot-password', {
        method: 'POST',
        body: { email },
      });
      setStatus('sent');
      setDevResetUrl(data.devResetUrl || null);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <PageShell
      eyebrow="Reset Password"
      title="Forgot your password?"
      subtitle="Enter the email on your account and we'll generate a reset link."
    >
      <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-10">
        {status === 'sent' ? (
          <div className="text-center py-2">
            <p className="text-emerald-400 text-sm font-medium">Check your email</p>
            <p className="text-white/60 text-sm mt-2">
              If an account exists for <span className="text-white">{email}</span>, a reset link
              has been generated.
            </p>

            {devResetUrl && (
              <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                <p className="text-white/50 text-xs mb-2">
                  Development mode — no email service is configured yet, so here's the link directly:
                </p>
                <Link to={devResetUrl} className="text-[#e8702a] text-xs break-all hover:underline">
                  {devResetUrl}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-xs text-white/60 mb-1.5 block" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className={INPUT_CLASSES}
              />
            </div>

            {status === 'error' && error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="mt-1 bg-[#e8702a] hover:bg-[#d2611f] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-7 py-3.5 rounded-full transition-all hover:scale-[1.02] active:scale-95"
            >
              {status === 'submitting' ? 'Sending…' : 'Send Reset Link'}
            </button>

            <p className="text-center text-xs text-white/50">
              Remembered it?{' '}
              <Link to="/login" className="text-[#e8702a] hover:underline">
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </PageShell>
  );
};

export default ForgotPassword;
