import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, Loader2, Check } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  onRecorded: (url: string, duration: number, blob: Blob) => void;
  onCancel: () => void;
}

export default function RecordingModal({ onRecorded, onCancel }: Props) {
  const { user } = useAuth();
  const [state, setState] = useState<'idle' | 'recording' | 'recorded' | 'uploading'>('idle');
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blobRef = useRef<Blob | null>(null);

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      setDuration(0);

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioDuration(duration);
        setState('recorded');
        stream.getTracks().forEach(t => t.stop());
      };

      mr.start(200);
      setState('recording');
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch {
      setError('Microphone access denied. Please allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  };

  const upload = async () => {
    if (!blobRef.current || !user) return;
    setState('uploading');
    const path = `${user.id}/${Date.now()}.webm`;
    const { data, error: e } = await supabase.storage
      .from('audio-scruts')
      .upload(path, blobRef.current, { contentType: 'audio/webm' });
    if (e) {
      setError(e.message);
      setState('recorded');
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('audio-scruts').getPublicUrl(data.path);
    onRecorded(publicUrl, audioDuration, blobRef.current);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current?.stop();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 pb-10 sm:pb-6"
        style={{ background: 'rgba(14,14,22,0.98)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h3 className="text-white font-semibold text-base mb-6 text-center">Record your take</h3>

        <div className="flex flex-col items-center gap-6">
          {/* Waveform visualization */}
          <div className="flex items-center gap-1 h-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1 rounded-full transition-all duration-100',
                  state === 'recording' ? 'bg-rose-400 waveform-bar' : 'bg-white/20'
                )}
                style={{
                  height: state === 'recording' ? `${16 + Math.random() * 24}px` : '8px',
                  animationDelay: `${i * 0.07}s`,
                }}
              />
            ))}
          </div>

          {/* Timer */}
          <span className="text-white font-mono text-2xl tabular-nums">
            {formatDuration(duration)}
          </span>

          {error && <p className="text-rose-400 text-sm text-center">{error}</p>}

          {/* Controls */}
          {state === 'idle' && (
            <button
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center hover:bg-rose-400 transition-colors shadow-lg shadow-rose-500/30"
            >
              <Mic size={26} className="text-white" />
            </button>
          )}

          {state === 'recording' && (
            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-white/10 border-2 border-rose-500 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <Square size={22} className="text-rose-400 fill-rose-400" />
            </button>
          )}

          {state === 'recorded' && audioUrl && (
            <div className="w-full space-y-3">
              <audio src={audioUrl} controls className="w-full h-8 opacity-60" style={{ filter: 'invert(1)' }} />
              <div className="flex gap-2">
                <button
                  onClick={() => { setState('idle'); setAudioUrl(null); setDuration(0); }}
                  className="flex-1 py-2.5 rounded-xl border border-white/12 text-white/50 hover:text-white/80 text-sm transition-colors"
                >
                  Re-record
                </button>
                <button
                  onClick={upload}
                  className="flex-1 py-2.5 rounded-xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-white/90 transition-colors"
                >
                  <Upload size={14} /> Use this
                </button>
              </div>
            </div>
          )}

          {state === 'uploading' && (
            <div className="flex items-center gap-2 text-white/50">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Uploading…</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
