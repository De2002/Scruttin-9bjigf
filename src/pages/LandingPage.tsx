import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Pause, Radio, Compass, Users, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const TARGET_CRITERIA = [
  {
    title: "You're tired of curated feeds & doomscrolling",
    desc: "You want a calm space free of infinite video loops, algorithmic rage-bait, and vanity metrics.",
  },
  {
    title: "You value voice, tone, and spoken nuance",
    desc: "You know that a human voice note conveys sincerity, warmth, and pause in ways text alone cannot.",
  },
  {
    title: "You want to be heard for your perspective",
    desc: "No follower hierarchies. Whether it's your 1st day or 100th, your words carry equal weight.",
  },
  {
    title: "You crave honest questions over quick hot takes",
    desc: "You want to listen to how people across different continents and walks of life genuinely experience the world.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<OscillatorNode[]>([]);

  // Simple, elegant harmonic chime so the play preview genuinely plays audio without external dependencies
  const startPreviewAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const freqs = [220, 277.18, 329.63, 440]; // A major 7 warm ambient chord
      const now = ctx.currentTime;
      synthNodesRef.current = [];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04 / freqs.length, now + idx * 0.15 + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.15);
        osc.stop(now + 4.8);
        synthNodesRef.current.push(osc);
      });

      setTimeout(() => {
        setIsPlaying(false);
      }, 4800);
    } catch {
      // AudioContext fallback
    }
  };

  const stopPreviewAudio = () => {
    try {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    } catch {
      // ignore
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPreviewAudio();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      startPreviewAudio();
    }
  };

  useEffect(() => {
    return () => {
      stopPreviewAudio();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#09090f] text-white flex flex-col justify-between selection:bg-white/20 selection:text-white font-sans antialiased">
      {/* Subtle, serene atmospheric illumination */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-white/[0.025] rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/[0.015] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 max-w-5xl mx-auto w-full px-6 pt-7 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Brand Logo Mark */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] border border-white/10">
            <svg
              width="20"
              height="14"
              viewBox="0 0 24 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="text-white"
            >
              <path d="M1 3 Q4 1 7 3 Q10 5 13 3 Q16 1 19 3 Q21 4 23 3" />
              <path d="M1 8 Q4 6 7 8 Q10 10 13 8 Q16 6 19 8 Q21 9 23 8" />
              <path d="M1 13 Q4 11 7 13 Q10 15 13 13 Q16 11 19 13 Q21 14 23 13" />
            </svg>
          </div>
          <span className="text-white font-semibold text-base tracking-tight">Scruttin</span>
        </div>

        <nav className="flex items-center gap-3">
          {user ? (
            <button
              type="button"
              id="header-app-btn"
              onClick={() => navigate('/stream')}
              className="text-xs font-medium text-white/80 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 px-4 py-2 rounded-full transition-all"
            >
              Open App
            </button>
          ) : (
            <>
              <button
                type="button"
                id="header-signin-btn"
                onClick={() => navigate('/auth')}
                className="text-xs text-white/60 hover:text-white font-medium px-3 py-1.5 transition-colors"
              >
                Sign in
              </button>
              <button
                type="button"
                id="header-stream-btn"
                onClick={() => navigate('/stream')}
                className="text-xs font-semibold text-black bg-white hover:bg-white/90 px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Enter</span>
                <ArrowRight size={12} />
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Main Core Section */}
      <main className="relative z-10 max-w-4xl mx-auto w-full px-6 py-12 sm:py-16 flex-1 flex flex-col items-center text-center justify-center">
        {/* Subtle Ethos Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-[0.16em] text-white/50 mb-7">
          <span>Less showing. More saying.</span>
        </div>

        {/* Minimal Hero Headline */}
        <h1 className="font-serif font-normal text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.15] max-w-2xl mb-5">
          A quieter web for human voice.
        </h1>

        {/* Concise Description */}
        <p className="text-sm sm:text-base text-white/55 leading-relaxed max-w-lg mb-9 font-light">
          No algorithms engineered for outrage. No follower counts or vanity feeds. Just honest daily questions, short reflections, and raw voice notes.
        </p>

        {/* Primary Call to Action */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-14">
          <button
            type="button"
            id="hero-stream-btn"
            onClick={() => navigate('/stream')}
            className="w-full sm:w-auto h-12 px-7 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Explore the Stream</span>
            <ArrowRight size={15} />
          </button>
          <button
            type="button"
            id="hero-dive-btn"
            onClick={() => navigate('/dive')}
            className="w-full sm:w-auto h-12 px-6 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/75 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Browse Questions</span>
          </button>
        </div>

        {/* The Rut Preview Card: One tangible, honest sample */}
        <div className="w-full max-w-md rounded-2xl border border-white/[0.09] bg-white/[0.025] backdrop-blur-md p-6 text-left shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-white/[0.15]">
          <div className="flex items-center justify-between text-xs text-white/40 mb-3 font-mono">
            <span className="uppercase tracking-widest text-[10px] text-amber-300/80">Question of the day</span>
            <span>Kampala</span>
          </div>

          <h2 className="font-serif text-lg sm:text-xl text-white font-medium leading-snug mb-4">
            “What is something adulthood never prepared you for?”
          </h2>

          {/* Rut Response Snippet */}
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-semibold text-white/80">
                  F
                </div>
                <span className="text-xs font-medium text-white/70">Founding Voice</span>
              </div>

              {/* Audio Play Button */}
              <button
                type="button"
                id="landing-play-audio-btn"
                onClick={togglePlay}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all',
                  isPlaying
                    ? 'bg-emerald-400 text-black shadow-sm font-semibold'
                    : 'bg-white/10 hover:bg-white/15 text-white/70 hover:text-white'
                )}
                aria-label={isPlaying ? 'Pause preview' : 'Play voice note preview'}
              >
                {isPlaying ? <Pause size={11} /> : <Play size={11} />}
                <span>{isPlaying ? '0:04' : '0:42'}</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-white/75 font-light leading-relaxed italic">
              “You realize almost everyone is improvising at the exact same time. Nobody is as in control as they appear on the outside.”
            </p>

            {/* Simulated subtle waveform animation when active */}
            {isPlaying && (
              <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center gap-1">
                {[40, 70, 30, 85, 60, 95, 45, 65, 80, 50, 90, 35].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-emerald-400/80 rounded-full transition-all duration-300"
                    style={{
                      height: `${h * 0.18}px`,
                      animation: `pulse 1s ease-in-out infinite ${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-white/40">
            <span>Free to listen & read</span>
            <button
              type="button"
              onClick={() => navigate('/stream')}
              className="text-white/60 hover:text-white transition-colors flex items-center gap-1 font-medium"
            >
              <span>Dive in</span>
              <ArrowRight size={11} />
            </button>
          </div>
        </div>

        {/* 'Join if...' Section for Target Audiences */}
        <section aria-labelledby="join-if-heading" className="w-full max-w-2xl mt-14 pt-12 border-t border-white/[0.06] text-left">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 block mb-1">
                Audience & Purpose
              </span>
              <h2 id="join-if-heading" className="font-serif text-2xl text-white font-medium">
                Join if…
              </h2>
            </div>
            <p className="text-xs text-white/40 font-light">Built for intentional listeners and thinkers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TARGET_CRITERIA.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 hover:border-white/15 hover:bg-white/[0.035] transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={11} className="text-emerald-400 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-[13px] font-semibold text-white/90 mb-1 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-white/45 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Invitation banner */}
          <div className="mt-5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-xs text-white/60">
              Sound like your kind of space? Drop a Rut or listen in today.
            </p>
            <button
              type="button"
              id="join-if-cta-btn"
              onClick={() => navigate(user ? '/stream' : '/auth')}
              className="w-full sm:w-auto text-xs font-semibold text-black bg-white hover:bg-white/90 px-4 py-2 rounded-full transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
            >
              <span>{user ? 'Open Stream' : 'Join Scruttin'}</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </section>

        {/* Three Ultra-Minimal Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl w-full mt-14 pt-12 border-t border-white/[0.06] text-left">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Radio size={14} className="text-amber-300/80" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/80">Voice First</h3>
            </div>
            <p className="text-xs text-white/45 leading-relaxed">
              Spoken audio preserves real pauses, warmth, and human nuance.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Compass size={14} className="text-sky-300/80" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/80">Open Questions</h3>
            </div>
            <p className="text-xs text-white/45 leading-relaxed">
              Prompts seeded for genuine depth, answered by voices across the world.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Users size={14} className="text-emerald-300/80" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/80">Zero Outrage</h3>
            </div>
            <p className="text-xs text-white/45 leading-relaxed">
              No vanity algorithms or follower clout. Every thought stands on its own.
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-20 max-w-5xl mx-auto w-full px-6 py-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/35">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate('/stream')} className="hover:text-white/70 transition-colors">
            Stream
          </button>
          <button type="button" onClick={() => navigate('/dive')} className="hover:text-white/70 transition-colors">
            Dive
          </button>
          <button type="button" onClick={() => navigate('/tagged')} className="hover:text-white/70 transition-colors">
            Tagged
          </button>
          <button type="button" onClick={() => navigate('/auth')} className="hover:text-white/70 transition-colors">
            Sign in
          </button>
        </div>

        <p>&copy; {new Date().getFullYear()} Scruttin &mdash; Less showing. More saying.</p>
      </footer>
    </div>
  );
}
