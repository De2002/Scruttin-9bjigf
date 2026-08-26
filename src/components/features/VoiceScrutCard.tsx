import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Pause, Play } from 'lucide-react';
import { formatDuration, cn } from '@/lib/utils';
import UserAvatar from './UserAvatar';
import type { User } from '@/types';

interface Props { duration: number; user: User; audioUrl?: string; className?: string; autoPlay?: boolean; onPlaybackEnd?: () => void; onPlaybackStart?: () => void; showUser?: boolean; }

const BAR_HEIGHTS = [18, 28, 42, 25, 34, 50, 30, 44, 22, 38, 55, 31, 47, 26, 40, 20, 35, 52, 29, 43, 24, 37, 49, 27, 41, 19, 33, 46, 23, 39, 30, 48, 26, 36, 21, 32];

export default function VoiceScrutCard({ duration, user, audioUrl, className, autoPlay = false, onPlaybackEnd, onPlaybackStart, showUser = true }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(duration);
  const [autoplayed, setAutoplayed] = useState(false);
  const total = mediaDuration || duration || 1;
  const progress = Math.min(1, currentTime / total);
  const location = [user.city, user.country].filter(Boolean).join(', ');
  const bars = useMemo(() => BAR_HEIGHTS, []);

  const startPlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try { await audio.play(); setPlaying(true); onPlaybackStart?.(); } catch { setPlaying(false); }
  };
  const togglePlay = (e: React.MouseEvent) => { e.stopPropagation(); if (playing) audioRef.current?.pause(); else void startPlay(); };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setMediaDuration(Number.isFinite(audio.duration) ? audio.duration : duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => { setPlaying(false); setCurrentTime(0); onPlaybackEnd?.(); };
    audio.addEventListener('timeupdate', onTime); audio.addEventListener('loadedmetadata', onLoaded); audio.addEventListener('play', onPlay); audio.addEventListener('pause', onPause); audio.addEventListener('ended', onEnded);
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('loadedmetadata', onLoaded); audio.removeEventListener('play', onPlay); audio.removeEventListener('pause', onPause); audio.removeEventListener('ended', onEnded); audio.pause(); };
  }, [duration, onPlaybackEnd]);

  useEffect(() => { if (autoPlay && !autoplayed) { setAutoplayed(true); const timer = window.setTimeout(() => void startPlay(), 250); return () => window.clearTimeout(timer); } }, [autoPlay, autoplayed]);

  return <div className={cn('flex flex-col gap-4', className)}>
    {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
    <div className="flex items-center gap-4">
      <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause voice Scrut' : 'Play voice Scrut'} className={cn('relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70', playing ? 'border-white/45 bg-white/15' : 'border-white/15 bg-white/7 hover:bg-white/12')}>
        {showUser ? <UserAvatar user={user} size="lg" shape="circle" /> : (playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />)}
        <span className="absolute inset-0 flex items-center justify-center bg-black/15">{playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}</span>
      </button>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold text-white/80">{user.display_name}</p><span className="font-mono text-[11px] tabular-nums text-white/40">{formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(total))}</span></div>
        <div className="flex h-12 items-center gap-1" aria-label="Voice waveform">
          {bars.map((height, index) => <span key={index} className={cn('w-1 rounded-full transition-colors duration-150', index / bars.length < progress ? 'bg-white/90' : 'bg-white/20', playing && index / bars.length >= progress && 'animate-pulse')} style={{ height }} />)}
        </div>
      </div>
    </div>
    {location && <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs text-white/45"><MapPin size={13} className="text-white/55" /><span>{location}</span><span className="ml-auto text-[10px] uppercase tracking-[0.16em] text-white/25">recorded here</span></div>}
  </div>;
}
