import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';
import UserAvatar from './UserAvatar';
import type { User } from '@/types';

interface Props {
  duration: number;
  user: User;
  audioUrl?: string;
  className?: string;
  /** If true, begin playback immediately when mounted */
  autoPlay?: boolean;
  /** Called when playback ends or is stopped */
  onPlaybackEnd?: () => void;
  /** Called when playback starts (to duck music) */
  onPlaybackStart?: () => void;
  /** Show user identity (avatar + name) — default true */
  showUser?: boolean;
}

const LEFT_BARS = 18;
const RIGHT_BARS = 18;

function generateSide(count: number, mirror = false): number[] {
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = mirror ? (count - 1 - i) / (count - 1) : i / (count - 1);
    const base = 0.18 + t * 0.65;
    bars.push(Math.min(1, base + (Math.sin(i * 1.3) * 0.2 + 0.1)));
  }
  return bars;
}

const LEFT = generateSide(LEFT_BARS, true);
const RIGHT = generateSide(RIGHT_BARS, false);
const ALL_BARS = [...LEFT, ...RIGHT];
const TOTAL = ALL_BARS.length;

export default function VoiceScrutCard({
  duration, user, audioUrl, className,
  autoPlay = false, onPlaybackEnd, onPlaybackStart,
  showUser = true,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAutoplayed = useRef(false);

  const stopPlay = () => {
    setPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setProgress(0);
    onPlaybackEnd?.();
  };

  const startPlay = () => {
    if (playing) return;
    setPlaying(true);
    onPlaybackStart?.();
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    const step = 100 / (duration * 10);
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setPlaying(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          onPlaybackEnd?.();
          return 0;
        }
        return p + step;
      });
    }, 100);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playing) stopPlay();
    else startPlay();
  };

  // Auto-play on mount if requested
  useEffect(() => {
    if (autoPlay && !hasAutoplayed.current) {
      hasAutoplayed.current = true;
      const t = setTimeout(() => startPlay(), 250);
      return () => clearTimeout(t);
    }
  }, [autoPlay]);

  // Stop playback when unmounted (user swiped away)
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const elapsed = Math.floor((progress / 100) * duration);
  const progressIndex = Math.floor((progress / 100) * TOTAL);

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {audioUrl && <audio ref={audioRef} src={audioUrl} style={{ display: 'none' }} />}

      {/* Profile avatar centered */}
      {showUser && (
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/15"
            style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.35) 0%,rgba(59,130,246,0.35) 100%)' }}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white/80 font-bold text-xl">
                  {user.display_name?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
            )}
          </div>
          {/* Playing ring */}
          {playing && (
            <span className="absolute -inset-1 rounded-2xl border border-white/25 animate-ping pointer-events-none" />
          )}
        </div>
      )}

      {/* Name */}
      {showUser && (
        <div className="text-center">
          <p className="text-white/80 font-semibold text-sm">{user.display_name}</p>
          {user.country && <p className="text-white/30 text-[11px] mt-0.5">{user.city ? `${user.city}, ${user.country}` : user.country}</p>}
        </div>
      )}

      {/* Waveform row */}
      <div className="relative flex items-center justify-center w-full" style={{ height: 64 }}>
        {/* Left bars */}
        <div className="flex items-center gap-[3px] justify-end" style={{ width: 'calc(50% - 32px)' }}>
          {LEFT.map((h, i) => {
            const filled = i < progressIndex;
            return (
              <div
                key={i}
                className={cn(
                  'rounded-full flex-shrink-0',
                  filled ? 'bg-white/85' : 'bg-white/22',
                  playing && !filled && 'waveform-bar'
                )}
                style={{
                  width: 2.5,
                  height: `${h * 48}px`,
                  animationDelay: playing ? `${(i % 5) * 0.13}s` : undefined,
                  animationPlayState: playing ? 'running' : 'paused',
                  transition: 'background-color 0.1s',
                }}
              />
            );
          })}
        </div>

        {/* Play/pause button */}
        <button
          onClick={togglePlay}
          className={cn(
            'relative shrink-0 w-[64px] h-[64px] rounded-full flex items-center justify-center transition-all duration-200',
            playing
              ? 'bg-white/18 border border-white/30'
              : 'bg-white/8 border border-white/15 hover:bg-white/15 hover:border-white/25'
          )}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing
            ? <Pause size={18} className="text-white" />
            : <Play size={18} className="text-white ml-0.5" />
          }
        </button>

        {/* Right bars */}
        <div className="flex items-center gap-[3px] justify-start" style={{ width: 'calc(50% - 32px)' }}>
          {RIGHT.map((h, i) => {
            const globalIdx = LEFT_BARS + i;
            const filled = globalIdx < progressIndex;
            return (
              <div
                key={i}
                className={cn(
                  'rounded-full flex-shrink-0',
                  filled ? 'bg-white/85' : 'bg-white/22',
                  playing && !filled && 'waveform-bar'
                )}
                style={{
                  width: 2.5,
                  height: `${h * 48}px`,
                  animationDelay: playing ? `${(i % 5) * 0.13}s` : undefined,
                  animationPlayState: playing ? 'running' : 'paused',
                  transition: 'background-color 0.1s',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Duration */}
      <span className="text-white/35 text-xs font-mono tabular-nums">
        {playing ? formatDuration(elapsed) : formatDuration(duration)}
      </span>
    </div>
  );
}
