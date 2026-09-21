import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { apiRequest } from '../api';
import { INPUT_CLASSES_COMPACT as inputClasses } from '../styles';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

interface ContactInfoModalProps {
  productName?: string;
  onClose: () => void;
}

/**
 * Shows HF Traders' contact details directly in a modal — used by the
 * "Contact Us" button on product cards so it opens in place instead of
 * navigating to the homepage. Includes a compact message form that posts
 * to the same /api/contact endpoint as the homepage contact form.
 */
const ContactInfoModal: React.FC<ContactInfoModalProps> = ({ productName, onClose }) => {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', message: '' });
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
      const message = productName ? `[Re: ${productName}] ${form.message}` : form.message;
      await apiRequest('/contact', { method: 'POST', body: { ...form, message } });
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
        className="bg-[#0b0f1a] border border-white/15 rounded-2xl w-full max-w-md p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
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
            <p className="text-emerald-400 text-sm font-medium">Message sent.</p>
            <p className="text-white/60 text-sm mt-2">Our team will get back to you shortly.</p>
            <button
              onClick={onClose}
              className="mt-6 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors border border-white/15"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-white text-lg font-playfair italic">Get in touch</h3>
            {productName && <p className="text-white/50 text-xs mt-1">About {productName}</p>}

            <ul className="mt-5 flex flex-col gap-3 text-sm text-white/70">
              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-[#e8702a] shrink-0" />
                Industrial Area, Sundar Road, Lahore, Pakistan
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-[#e8702a] shrink-0" />
                0301-2059933
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={16} className="text-[#e8702a] shrink-0" />
                WhatsApp: 0301-2059933
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-[#e8702a] shrink-0" />
                hanifusman695@gmail.com
              </li>
              <li className="flex items-center gap-3">
                <Clock size={16} className="text-[#e8702a] shrink-0" />
                Mon – Sat, 8:00 AM – 7:00 PM
              </li>
            </ul>

            <div className="my-5 border-t border-white/10" />

            <p className="text-white/50 text-xs mb-3">Or send a quick message:</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input name="fullName" type="text" placeholder="Full Name" value={form.fullName} onChange={handleChange} required className={inputClasses} />
              <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required className={inputClasses} />
              <input name="phone" type="tel" placeholder="Phone Number" value={form.phone} onChange={handleChange} className={inputClasses} />
              <textarea name="message" placeholder="Message" rows={3} value={form.message} onChange={handleChange} required className={`${inputClasses} resize-none`} />

              {status === 'error' && error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="mt-1 bg-[#e8702a] hover:bg-[#d2611f] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all"
              >
                {status === 'submitting' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ContactInfoModal;
