import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePreferences } from '@/stores/preferencesStore';
import { cn } from '@/lib/utils';

interface Props {
  text: string;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// Speed map
const SPEED_MAP: Record<string, number> = {
  slow: 140,
  normal: 80,
  fast: 40,
  instant: 0,
};
const CHUNK_SIZE = 3; // words per tick

// Singleton audio manager so the same sound doesn't overlap itself
let typingAudio: HTMLAudioElement | null = null;
let typingSoundUrl: string | null = null;
let typingSoundEnabled = true;

export function setTypingSoundUrl(url: string | null) {
  typingSoundUrl = url;
}
export function setTypingSoundEnabled(enabled: boolean) {
  typingSoundEnabled = enabled;
}

function playTypingTick() {
  if (!typingSoundEnabled || !typingSoundUrl) return;
  if (!typingAudio) {
    typingAudio = new Audio(typingSoundUrl);
    typingAudio.volume = 0.25;
  }
  // Only replay if not already playing (avoids overlap)
  if (typingAudio.paused || typingAudio.ended) {
    typingAudio.currentTime = 0;
    typingAudio.play().catch(() => {});
  }
}

function stopTypingSound() {
  if (typingAudio && !typingAudio.paused) {
    typingAudio.pause();
    typingAudio.currentTime = 0;
  }
}

export default function TextReveal({ text, onComplete, className, style }: Props) {
  const { reducedMotion, typingSpeed } = usePreferences();
  const words = text.split(' ');
  const [visibleCount, setVisibleCount] = useState(reducedMotion ? words.length : 0);
  const [complete, setComplete] = useState(reducedMotion);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const interval = SPEED_MAP[typingSpeed ?? 'normal'] ?? 80;

  const revealAll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopTypingSound();
    setVisibleCount(words.length);
    setComplete(true);
    onComplete?.();
  }, [words.length, onComplete]);

  useEffect(() => {
    if (reducedMotion || interval === 0) {
      stopTypingSound();
      setVisibleCount(words.length);
      setComplete(true);
      onComplete?.();
      return;
    }

    setVisibleCount(0);
    setComplete(false);

    const startTimer = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setVisibleCount(prev => {
          const next = prev + CHUNK_SIZE;
          // Play tick sound while typing
          playTypingTick();
          if (next >= words.length) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            stopTypingSound();
            setComplete(true);
            onComplete?.();
            return words.length;
          }
          return next;
        });
      }, interval);
    }, 200);

    return () => {
      clearTimeout(startTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopTypingSound();
    };
  }, [text, reducedMotion, interval]);

  const visibleWords = words.slice(0, visibleCount);
  const hiddenWords = words.slice(visibleCount);

  return (
    <p
      className={cn('leading-relaxed cursor-pointer select-none', className)}
      style={style}
      onClick={complete ? undefined : revealAll}
      title={complete ? undefined : 'Tap to show full text'}
    >
      <span>{visibleWords.join(' ')}</span>
      {!complete && visibleCount > 0 && (
        <span className="inline-block w-0.5 h-[1em] bg-white/70 ml-0.5 align-middle cursor-blink" />
      )}
      {!complete && (
        <span className="invisible select-none">{' ' + hiddenWords.join(' ')}</span>
      )}
    </p>
  );
}
