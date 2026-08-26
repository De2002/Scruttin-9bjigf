import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Props {
  scrutId: string;
  onClose: () => void;
}

const REASONS = [
  'Hate speech or discrimination',
  'Harassment or bullying',
  'Misinformation',
  'Spam or self-promotion',
  'Explicit or inappropriate content',
  'Violence or threats',
  'Other',
];

export default function ReportModal({ scrutId, onClose }: Props) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!reason || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from('reports').insert({
      scrut_id: scrutId,
      reporter_id: user.id,
      reason,
    });
    setSubmitting(false);
    if (error) {
      if (error.code === '23505') {
        toast.info("You've already reported this scrut.");
      } else {
        toast.error('Could not send report. Try again.');
      }
      onClose();
      return;
    }
    setDone(true);
    setTimeout(onClose, 1800);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ background: 'rgba(14,14,22,0.98)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {done ? (
          <div className="p-8 text-center">
            <div className="text-3xl mb-3">🙏</div>
            <h3 className="text-white font-semibold mb-1">Report received</h3>
            <p className="text-white/40 text-sm">Our team will review this scrut.</p>
          </div>
        ) : (
          <div className="p-5 pb-10 sm:pb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold">Report this scrut</h3>
              <button onClick={onClose} className="text-white/30 hover:text-white p-1 transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-white/40 text-sm mb-4">Why are you reporting this?</p>
            <div className="space-y-1.5 mb-5">
              {REASONS.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all',
                    reason === r
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      : 'bg-white/4 border-white/8 text-white/60 hover:bg-white/8'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              onClick={submit}
              disabled={!reason || submitting || !user}
              className={cn(
                'w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
                reason && user && !submitting
                  ? 'bg-rose-500 text-white hover:bg-rose-400'
                  : 'bg-white/8 text-white/25 cursor-not-allowed'
              )}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit report'}
            </button>
            {!user && (
              <p className="text-white/30 text-xs text-center mt-3">Sign in to report content</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
