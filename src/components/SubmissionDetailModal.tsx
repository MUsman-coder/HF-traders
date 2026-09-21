import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Send } from 'lucide-react';
import { adminApiRequest } from '../adminApi';
import { INPUT_CLASSES_COMPACT as inputClasses } from '../styles';

interface DetailRow {
  label: string;
  value: string | null | undefined;
}

interface SubmissionDetailModalProps {
  title: string;
  rows: DetailRow[];
  existingReply?: string | null;
  repliedAt?: string | null;
  replyEndpoint: string; // e.g. '/quotes/123/reply'
  onClose: () => void;
  onReplied: () => void;
}

const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  title,
  rows,
  existingReply,
  repliedAt,
  replyEndpoint,
  onClose,
  onReplied,
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await adminApiRequest(replyEndpoint, { method: 'POST', body: { message } });
      setSent(true);
      onReplied();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reply.');
    } finally {
      setSending(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0b0f1a] border border-white/15 rounded-2xl w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-white text-lg font-playfair italic">{title}</h3>

        <div className="mt-5 flex flex-col gap-2.5">
          {rows.map(
            (row) =>
              row.value && (
                <div key={row.label} className="text-sm">
                  <span className="text-white/40 text-xs uppercase tracking-wide">{row.label}</span>
                  <p className="text-white/85 mt-0.5 whitespace-pre-wrap">{row.value}</p>
                </div>
              )
          )}
        </div>

        {existingReply && (
          <div className="mt-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <span className="text-emerald-400 text-xs uppercase tracking-wide font-medium">
              Already replied {repliedAt ? `· ${new Date(repliedAt).toLocaleString()}` : ''}
            </span>
            <p className="text-white/75 text-sm mt-1.5 whitespace-pre-wrap">{existingReply}</p>
          </div>
        )}

        <div className="my-5 border-t border-white/10" />

        {sent ? (
          <p className="text-emerald-400 text-sm">Reply sent.</p>
        ) : (
          <form onSubmit={handleSend} className="flex flex-col gap-3">
            <label className="text-xs text-white/60">
              {existingReply ? 'Send another reply' : 'Respond to this person'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              placeholder="Type your response — this will be emailed to them."
              className={`${inputClasses} resize-none`}
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="self-start flex items-center gap-2 bg-[#e8702a] hover:bg-[#d2611f] disabled:opacity-60 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all"
            >
              <Send size={14} />
              {sending ? 'Sending…' : 'Send Reply'}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SubmissionDetailModal;
