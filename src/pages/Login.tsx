import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import PasswordInput from '../components/PasswordInput';
import { apiRequest } from '../api';
import { INPUT_CLASSES as inputClasses } from '../styles';

type SubmitStatus = 'idle' | 'submitting' | 'error';

interface LoggedInUser {
  id: number;
  fullName: string;
  email: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      const data = await apiRequest<{ user: LoggedInUser }>('/signup/login', {
        method: 'POST',
        body: { email, password },
      });
      // Lightweight session marker for this demo app — swap for real
      // token-based auth (JWT / httpOnly cookies) before going to production.
      sessionStorage.setItem('hf_traders_user', JSON.stringify(data.user));
      navigate('/account');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <PageShell
      eyebrow="Log In"
      title="Welcome back"
      subtitle="Log in to manage your quotes, orders, and account details."
    >
      <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-10">
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
              className={inputClasses}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-white/60" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="text-xs text-[#e8702a] hover:underline">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className={inputClasses}
            />
          </div>

          {status === 'error' && error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="mt-1 bg-[#e8702a] hover:bg-[#d2611f] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-7 py-3.5 rounded-full transition-all hover:scale-[1.02] active:scale-95"
          >
            {status === 'submitting' ? 'Logging in…' : 'Log In'}
          </button>

          <p className="text-center text-xs text-white/50">
            Don't have an account?{' '}
            <Link to="/sign-up" className="text-[#e8702a] hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </PageShell>
  );
};

export default Login;
