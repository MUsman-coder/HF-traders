import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import PasswordInput from '../../components/PasswordInput';
import { apiRequest } from '../../api';
import { setAdminToken, setAdminIdentity } from '../../adminApi';
import { INPUT_CLASSES as inputClasses } from '../../styles';

type SubmitStatus = 'idle' | 'submitting' | 'error';

interface AdminLoginResponse {
  token: string;
  admin: { name: string; email: string };
}

const AdminLogin: React.FC = () => {
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
      const data = await apiRequest<AdminLoginResponse>('/admin/login', {
        method: 'POST',
        body: { email, password },
      });
      setAdminToken(data.token);
      setAdminIdentity(data.admin);
      navigate('/admin');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <PageShell eyebrow="Admin" title="Admin login" subtitle="Restricted access — HF Traders staff only.">
      <div className="max-w-sm mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-xs text-white/60 mb-1.5 block" htmlFor="email">
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className={inputClasses}
            />
          </div>

          <div>
            <label className="text-xs text-white/60 mb-1.5 block" htmlFor="password">
              Admin Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClasses}
            />
          </div>

          {status === 'error' && error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="bg-[#e8702a] hover:bg-[#d2611f] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.02] active:scale-95"
          >
            {status === 'submitting' ? 'Checking…' : 'Log In'}
          </button>
        </form>
      </div>
    </PageShell>
  );
};

export default AdminLogin;
