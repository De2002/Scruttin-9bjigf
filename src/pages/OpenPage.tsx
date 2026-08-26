import { useState, useRef, useCallback, useEffect } from 'react';
import { OPEN_SCRUTS } from '@/constants/mockData';
import TextReveal from '@/components/features/TextReveal';
import VoiceScrutCard from '@/components/features/VoiceScrutCard';
import UserAvatar from '@/components/features/UserAvatar';
import AtmosphereControls from '@/components/layout/AtmosphereControls';
import ComposeModal from '@/components/features/ComposeModal';
import ScrutDetailSheet from '@/components/features/ScrutDetailSheet';
import ResonatesButton from '@/components/features/ResonatesButton';
import { cn } from '@/lib/utils';
import type { Scrut } from '@/types';

const TUTORIAL_KEY = 'scruttin_open_swipe_seen';
const SWIPE_THRESHOLD = 52;

type Phase = 'idle' | 'exiting' | 'entering';

export default function OpenPage() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [composeOpen, setComposeOpen] = useState(false);
  const [detailScrut, setDetailScrut] = useState<Scrut | null>(null);
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem(TUTORIAL_KEY));
  const [tutorialVisible, setTutorialVisible] = useState(true);

  const touchStartY = useRef(0);
  const mouseStartY = useRef(0);
  const isDragging = useRef(false);
  const advancing = useRef(false);

  const scrut = OPEN_SCRUTS[index];

  useEffect(() => {
    if (!showTutorial) return;
    const timer = setTimeout(() => setTutorialVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [showTutorial]);

  const advance = useCallback(() => {
    if (advancing.current) return;
    advancing.current = true;
    if (showTutorial) {
      setShowTutorial(false);
      setTutorialVisible(false);
      localStorage.setItem(TUTORIAL_KEY, '1');
    }
    setPhase('exiting');
    setTimeout(() => {
      setIndex(prev => (prev + 1) % OPEN_SCRUTS.length);
      setPhase('entering');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setPhase('idle');
        advancing.current = false;
      }));
    }, 380);
  }, [showTutorial]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (dy < -SWIPE_THRESHOLD) advance();
  };
  const onMouseDown = (e: React.MouseEvent) => { mouseStartY.current = e.clientY; isDragging.current = true; };
  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dy = e.clientY - mouseStartY.current;
    if (dy < -SWIPE_THRESHOLD) advance();
  };

  const contentAnim = cn(
    phase === 'exiting' && 'scrut-exit-up',
    phase === 'entering' && 'scrut-enter-below',
    phase === 'idle' && 'opacity-100 translate-y-0',
  );

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      style={{ userSelect: 'none', cursor: 'default' }}
    >
      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 pt-safe pt-4 pointer-events-none">
        <span className="text-white/20 text-[11px] font-medium tracking-widest uppercase">Open</span>
        <span className="pointer-events-auto">
          <AtmosphereControls />
        </span>
      </div>

      {/* Animated scrut content */}
      <div key={scrut.id} className={cn('w-full max-w-sm px-7 z-10', contentAnim)}>
        {/* User identity — circular on Open page */}
        <div className="flex items-end gap-3 mb-6">
          {/* Only text scruts → avatar tap opens profile sheet; voice → no tap */}
          {scrut.type !== 'voice' ? (
            <div
              className="cursor-pointer transition-opacity hover:opacity-80 active:opacity-60"
              onClick={e => { e.stopPropagation(); setDetailScrut(scrut); }}
              onTouchEnd={e => { e.stopPropagation(); setDetailScrut(scrut); }}
            >
              <UserAvatar user={scrut.user} size="lg" shape="circle" />
            </div>
          ) : (
            <UserAvatar user={scrut.user} size="lg" shape="circle" />
          )}
          <div className="pb-0.5">
            <p className="text-white font-semibold text-[15px] leading-tight">{scrut.user.display_name}</p>
            {(scrut.user.city || scrut.user.country) && (
              <p className="text-white/35 text-xs mt-0.5">
                {scrut.user.city ? `${scrut.user.city}, ${scrut.user.country}` : scrut.user.country}
              </p>
            )}
          </div>
        </div>

        {/* Text scrut */}
        {(scrut.type === 'text' || scrut.type === 'voice_text') && scrut.text && (
          <TextReveal
            text={scrut.text}
            className="text-white/88 text-[19px] font-serif leading-[1.72] tracking-[0.01em]"
          />
        )}

        {/* Voice-only scrut */}
        {scrut.type === 'voice' && scrut.audio_duration && (
          <div className="py-4">
            <VoiceScrutCard duration={scrut.audio_duration} user={scrut.user} audioUrl={scrut.audio_url} />
          </div>
        )}

        {/* Resonates */}
        <div className="mt-8">
          <ResonatesButton
            scrutId={scrut.id}
            initialCount={scrut.resonate_count ?? 0}
            initialResonated={scrut.resonated_by_me ?? false}
          />
        </div>
      </div>

      {/* Tutorial hint */}
      {showTutorial && (
        <div className={cn('absolute bottom-28 left-0 right-0 flex flex-col items-center gap-1.5 z-20 pointer-events-none transition-opacity duration-700', tutorialVisible ? 'opacity-60' : 'opacity-0')}>
          <span className="text-white text-base" style={{ animation: 'tutorialBob 1.8s ease-in-out infinite' }}>↑</span>
          <p className="text-white/55 text-[11px] tracking-widest uppercase font-medium">Swipe for next Scrut</p>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setComposeOpen(true)}
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        className="absolute bottom-24 right-5 z-30 glass border border-white/10 rounded-full px-4 h-10 text-white/50 hover:text-white/80 font-semibold text-sm transition-all duration-200 hover:border-white/20"
      >
        Scrut
      </button>

      {/* Progress dots */}
      <div className="absolute bottom-[5.5rem] left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
        {OPEN_SCRUTS.map((_, i) => (
          <span key={i} className={cn('rounded-full transition-all duration-300', i === index ? 'w-4 h-1 bg-white/50' : 'w-1 h-1 bg-white/15')} />
        ))}
      </div>

      {composeOpen && <ComposeModal onClose={() => setComposeOpen(false)} defaultMode="open" />}
      {detailScrut && <ScrutDetailSheet scrut={detailScrut} onClose={() => setDetailScrut(null)} />}
    </div>
  );
}
