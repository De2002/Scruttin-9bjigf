import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import resonatesRedImg from '@/assets/resonates_red.png';
import resonatesBlackImg from '@/assets/resonates_black.png';

interface Props {
  scrutId: string;
  initialCount?: number;
  initialResonated?: boolean;
  className?: string;
}

export default function ResonatesButton({ scrutId, initialCount = 0, initialResonated = false, className }: Props) {
  const { user } = useAuth();
  const [resonated, setResonated] = useState(initialResonated);
  const [count, setCount] = useState(initialCount);
  const [burst, setBurst] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setResonated(initialResonated);
    setCount(initialCount);
  }, [initialResonated, initialCount]);

  const toggle = async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!user || pending) return;
    const next = !resonated;
    setResonated(next);
    setCount(c => next ? c + 1 : Math.max(0, c - 1));
    if (next) {
      setBurst(true);
      setTimeout(() => setBurst(false), 500);
    }
    setPending(true);
    if (next) {
      await supabase.from('resonates').insert({ scrut_id: scrutId, user_id: user.id });
    } else {
      await supabase.from('resonates').delete().eq('scrut_id', scrutId).eq('user_id', user.id);
    }
    setPending(false);
  };

  return (
    <button
      onClick={toggle}
      onTouchEnd={toggle}
      disabled={!user}
      className={cn(
        'flex items-center gap-1.5 transition-all duration-200 group select-none',
        resonated ? 'opacity-100' : 'opacity-35 hover:opacity-70',
        !user && 'cursor-default',
        className
      )}
      aria-label={resonated ? 'Remove resonate' : 'Resonate'}
    >
      <span
        className={cn(
          'relative flex items-center justify-center transition-all duration-200',
          burst ? 'scale-125' : resonated ? 'scale-110' : 'scale-100 group-hover:scale-105',
        )}
        style={{ width: 30, height: 30 }}
      >
        <img
          src={resonated ? resonatesRedImg : resonatesBlackImg}
          alt="Resonates"
          className={cn(
            'w-full h-full object-contain transition-all duration-200',
            !resonated && 'brightness-0 invert opacity-60'
          )}
        />
        {burst && (
          <span
            className="absolute inset-0 rounded-full bg-rose-400/20 animate-ping"
            style={{ animationDuration: '0.5s', animationIterationCount: '1' }}
          />
        )}
      </span>
      {count > 0 && (
        <span className={cn(
          'text-[11px] font-medium tabular-nums transition-colors duration-200',
          resonated ? 'text-rose-400' : 'text-white/40'
        )}>
          {count}
        </span>
      )}
    </button>
  );
}
