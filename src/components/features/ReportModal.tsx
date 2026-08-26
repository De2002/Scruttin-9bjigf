import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

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
    <Sheet open onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        side="bottom"
        className="z-[301] max-h-[min(88dvh,31rem)] w-full overflow-y-auto overscroll-contain rounded-t-[1.75rem] border-white/15 bg-[#101017] p-0 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:mx-auto sm:max-w-sm sm:rounded-3xl"
      >
        {done ? (
          <div className="p-8 text-center">
            <div className="text-3xl mb-3">🙏</div>
            <h3 className="text-white font-semibold mb-1">Report received</h3>
            <p className="text-white/40 text-sm">Our team will review this scrut.</p>
          </div>
        ) : (
          <div className="p-4 sm:p-5">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20 sm:hidden" aria-hidden="true" />
            <div className="mb-4 flex items-center justify-between">
              <SheetTitle id="report-title" className="text-base font-semibold text-white">Report this Scrut</SheetTitle>
              <button type="button" aria-label="Close report dialog" onClick={onClose} className="rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                <X size={18} />
              </button>
            </div>
            <p className="mb-3 text-sm text-white/60">Why are you reporting this?</p>
            <div className="mb-4 grid gap-2">
              {REASONS.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={cn(
                    'w-full min-h-11 rounded-xl border px-4 py-2.5 text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70',
                    reason === r
                      ? 'border-rose-400/60 bg-rose-500/20 text-white'
                      : 'border-white/15 bg-white/[0.06] text-white/80 hover:bg-white/10'
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
                'w-full min-h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70',
                reason && user && !submitting
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-950/40 hover:bg-rose-400'
                  : 'cursor-not-allowed bg-white/10 text-white/40'
              )}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit report'}
            </button>
            {!user && (
              <p className="text-white/30 text-xs text-center mt-3">Sign in to report content</p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
