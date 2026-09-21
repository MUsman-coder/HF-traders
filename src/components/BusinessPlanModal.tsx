import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { apiRequest } from '../api';
import { INPUT_CLASSES_COMPACT as inputClasses } from '../styles';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

interface BusinessPlanModalProps {
  planName: string;
  onClose: () => void;
}

const BusinessPlanModal: React.FC<BusinessPlanModalProps> = ({ planName, onClose }) => {
  const [form, setForm] = useState({ fullName: '', companyName: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await apiRequest('/business-plan', { method: 'POST', body: { planName, ...form } });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0b0f1a] border border-white/15 rounded-2xl w-full max-w-md p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {status === 'success' ? (
          <div className="text-center py-6">
            <p className="text-emerald-400 text-sm font-medium">Request received.</p>
            <p className="text-white/60 text-sm mt-2">
              Our team will reach out about the <span className="text-white">{planName}</span> plan shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors border border-white/15"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-white text-lg font-playfair italic">Get started</h3>
            <p className="text-white/50 text-xs mt-1">{planName} plan</p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
              <input name="fullName" type="text" placeholder="Full Name" value={form.fullName} onChange={handleChange} required className={inputClasses} />
              <input name="companyName" type="text" placeholder="Company Name" value={form.companyName} onChange={handleChange} className={inputClasses} />
              <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required className={inputClasses} />
              <input name="phone" type="tel" placeholder="Phone Number" value={form.phone} onChange={handleChange} className={inputClasses} />
              <textarea name="message" placeholder="Tell us about your volume / needs" rows={3} value={form.message} onChange={handleChange} className={`${inputClasses} resize-none`} />

              {status === 'error' && error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="mt-1 bg-[#e8702a] hover:bg-[#d2611f] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all"
              >
                {status === 'submitting' ? 'Sending…' : 'Submit Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default BusinessPlanModal;
