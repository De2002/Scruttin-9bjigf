import { useEffect, useRef, useState } from 'react';
import { usePreferences } from '@/stores/preferencesStore';

interface Track {
  id: string;
  title: string;
  artist?: string;
  url: string;
}

interface Props {
  tracks: Track[];
  voicePlaying?: boolean;
}

export default function MusicPlayer({ tracks, voicePlaying = false }: Props) {
  const { musicEnabled, musicVolume, selectedTrackId } = usePreferences();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  // Determine playback URL:
  // selectedTrackId can be 'personal:URL' (private upload) or a DB track ID
  useEffect(() => {
    if (!musicEnabled) { setCurrentUrl(null); return; }

    if (selectedTrackId?.startsWith('personal:')) {
      setCurrentUrl(selectedTrackId.replace('personal:', ''));
      return;
    }

    if (!tracks.length) return;
    const track = tracks.find(t => t.id === selectedTrackId) ?? tracks[0];
    setCurrentUrl(track?.url ?? null);
  }, [tracks, selectedTrackId, musicEnabled]);

  // Manage playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (musicEnabled && currentUrl) {
      if (audio.src !== currentUrl) {
        audio.src = currentUrl;
        audio.loop = true;
      }
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [musicEnabled, currentUrl]);

  // Duck volume when voice is playing, restore when done
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const targetVol = voicePlaying
      ? Math.min((musicVolume / 100) * 0.15, 0.15)
      : musicVolume / 100;

    // Smooth volume transition
    const step = (targetVol - audio.volume) / 10;
    let steps = 0;
    const interval = setInterval(() => {
      if (!audioRef.current) { clearInterval(interval); return; }
      steps++;
      audioRef.current.volume = Math.max(0, Math.min(1, audioRef.current.volume + step));
      if (steps >= 10) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [voicePlaying, musicVolume]);

  return <audio ref={audioRef} style={{ display: 'none' }} />;
}
