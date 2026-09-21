import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import PasswordInput from '../components/PasswordInput';
import { apiRequest } from '../api';
import { INPUT_CLASSES as inputClasses } from '../styles';

const labelClasses = 'text-xs text-white/60 mb-1.5 block';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

interface FormState {
  fullName: string;
  companyName: string;
  businessType: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}

const INITIAL_FORM: FormState = {
  fullName: '',
  companyName: '',
  businessType: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: '',
  agreedToTerms: false,
};

const SignUp: React.FC = () => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setStatus('error');
      setError('Passwords do not match.');
      return;
    }
    if (!form.agreedToTerms) {
      setStatus('error');
      setError('Please agree to the Terms & Conditions to continue.');
      return;
    }

    setStatus('submitting');
    try {
      await apiRequest('/signup', {
        method: 'POST',
        body: {
          fullName: form.fullName,
          companyName: form.companyName,
          businessType: form.businessType,
          email: form.email,
          phone: form.phone,
          address: form.address,
          password: form.password,
          confirmPassword: form.confirmPassword,
        },
      });
      setStatus('success');
      setForm(INITIAL_FORM);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <PageShell
      eyebrow="Sign Up"
      title="Create your business account"
      subtitle="Register with HF Traders to access preferred pricing, request quotes, and manage your scrap transactions."
    >
      <div className="max-w-xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-10">
        {status === 'success' ? (
          <div className="text-center py-6">
            <p className="text-emerald-400 text-sm font-medium">Account created successfully.</p>
            <p className="text-white/60 text-sm mt-2">
              You can now{' '}
              <Link to="/login" className="text-[#e8702a] hover:underline">
                log in to your account
              </Link>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses} htmlFor="fullName">Full Name</label>
                <input id="fullName" name="fullName" type="text" placeholder="Your full name" value={form.fullName} onChange={handleChange} required className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses} htmlFor="companyName">Company Name</label>
                <input id="companyName" name="companyName" type="text" placeholder="Your company name" value={form.companyName} onChange={handleChange} className={inputClasses} />
              </div>
            </div>

            <div>
              <label className={labelClasses} htmlFor="businessType">Business Type</label>
              <select id="businessType" name="businessType" value={form.businessType} onChange={handleChange} className={`${inputClasses} appearance-none`}>
                <option value="" className="bg-black">Select business type</option>
                <option value="supplier" className="bg-black">Scrap Supplier</option>
                <option value="manufacturer" className="bg-black">Manufacturer</option>
                <option value="trader" className="bg-black">Trader / Reseller</option>
                <option value="individual" className="bg-black">Individual</option>
                <option value="other" className="bg-black">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses} htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="you@company.com" value={form.email} onChange={handleChange} required className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses} htmlFor="phone">Phone Number</label>
                <input id="phone" name="phone" type="tel" placeholder="+92 300 1234567" value={form.phone} onChange={handleChange} className={inputClasses} />
              </div>
            </div>

            <div>
              <label className={labelClasses} htmlFor="address">Address</label>
              <input id="address" name="address" type="text" placeholder="Business or pickup address" value={form.address} onChange={handleChange} className={inputClasses} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses} htmlFor="password">Password</label>
                <PasswordInput id="password" name="password" placeholder="Create a password" value={form.password} onChange={handleChange} required minLength={6} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses} htmlFor="confirmPassword">Confirm Password</label>
                <PasswordInput id="confirmPassword" name="confirmPassword" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required minLength={6} className={inputClasses} />
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-white/60 mt-1">
              <input type="checkbox" name="agreedToTerms" checked={form.agreedToTerms} onChange={handleChange} className="mt-0.5 accent-[#e8702a]" />
              I agree to the <span className="text-[#e8702a] hover:underline cursor-pointer">Terms &amp; Conditions</span>
            </label>

            {status === 'error' && error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="mt-2 bg-[#e8702a] hover:bg-[#d2611f] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-7 py-3.5 rounded-full transition-all hover:scale-[1.02] active:scale-95"
            >
              {status === 'submitting' ? 'Creating account…' : 'Create Account'}
            </button>

            <p className="text-center text-xs text-white/50 mt-1">
              Already have an account?{' '}
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

export default SignUp;
