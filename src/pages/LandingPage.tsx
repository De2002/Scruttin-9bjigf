import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Unsplash curated images — street interviews, people talking, diverse faces, global
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=1400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1400&q=80&auto=format&fit=crop',
];

const SAMPLE_QUESTIONS = [
  'What\'s something adulthood didn\'t prepare you for?',
  'When did you realise you were becoming an adult?',
  'What do you wish schools actually taught?',
  'What makes someone a good parent?',
  'What\'s something you stopped caring about as you got older?',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);
  const [prevImgIndex, setPrevImgIndex] = useState<number | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [qVisible, setQVisible] = useState(true);

  // Crossfade images every 5s
  useEffect(() => {
    const t = setInterval(() => {
      setPrevImgIndex(imgIndex);
      setImgIndex(i => (i + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(t);
  }, [imgIndex]);

  // Cycle question text every 4s with fade
  useEffect(() => {
    const t = setInterval(() => {
      setQVisible(false);
      setTimeout(() => {
        setQIndex(i => (i + 1) % SAMPLE_QUESTIONS.length);
        setQVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      {/* Background image crossfade */}
      {HERO_IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 pointer-events-none select-none"
          style={{
            opacity: i === imgIndex ? 1 : i === prevImgIndex ? 0 : 0,
            zIndex: i === imgIndex ? 1 : i === prevImgIndex ? 0 : -1,
          }}
        />
      ))}

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 35%, rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.92) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col h-full px-6">

        {/* Top bar */}
        <div className="flex items-center justify-between pt-safe pt-5 shrink-0">
          <div className="flex items-center gap-2">
            <svg width="22" height="15" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="text-white/90">
              <path d="M1 3 Q4 1 7 3 Q10 5 13 3 Q16 1 19 3 Q21 4 23 3" />
              <path d="M1 8 Q4 6 7 8 Q10 10 13 8 Q16 6 19 8 Q21 9 23 8" />
              <path d="M1 13 Q4 11 7 13 Q10 15 13 13 Q16 11 19 13 Q21 14 23 13" />
            </svg>
            <span className="text-white font-bold text-[17px] tracking-tight">Scruttin</span>
          </div>
          <button
            onClick={() => navigate('/auth')}
            className="text-white/60 hover:text-white text-sm transition-colors font-medium"
          >
            Sign in
          </button>
        </div>

        {/* Centre content */}
        <div className="flex-1 flex flex-col justify-end pb-12">

          {/* Sample question cycling */}
          <div className="mb-8">
            <p className="text-white/35 text-[10px] uppercase tracking-[0.2em] font-semibold mb-3">
              Being asked right now
            </p>
            <p
              className={cn(
                'font-serif text-white/85 text-[18px] leading-[1.5] transition-all duration-400',
                qVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              )}
              style={{ maxWidth: 320 }}
            >
              "{SAMPLE_QUESTIONS[qIndex]}"
            </p>
          </div>

          {/* Main headline */}
          <h1 className="font-serif font-bold text-white leading-[1.15] mb-4" style={{ fontSize: 'clamp(38px, 10vw, 52px)' }}>
            The world<br />is talking.
          </h1>

          <p className="text-white/50 text-[15px] leading-[1.6] mb-10 max-w-[300px]">
            Questions. Voices. Perspectives.<br />
            From everywhere. All at once.
          </p>

          {/* Primary CTA */}
          <button
            onClick={() => navigate('/stream')}
            className="w-full max-w-[300px] py-4 rounded-2xl bg-white text-black font-semibold text-[15px] tracking-tight
                       hover:bg-white/90 active:scale-[0.98] transition-all duration-150 mb-3 flex items-center justify-center gap-2"
          >
            Enter the stream
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          {/* Secondary */}
          <button
            onClick={() => navigate('/auth')}
            className="w-full max-w-[300px] py-3.5 rounded-2xl border border-white/20 text-white/60 font-medium text-[14px]
                       hover:border-white/40 hover:text-white/80 transition-all duration-150 mb-8"
          >
            Create account
          </button>

          {/* Tiny reassurance line */}
          <p className="text-white/25 text-[11px] tracking-wide max-w-[260px]">
            No account needed to listen. Ask once a day. Answer as much as you want.
          </p>
        </div>

        {/* Image dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 pointer-events-none z-30">
          {HERO_IMAGES.map((_, i) => (
            <span
              key={i}
              className={cn(
                'rounded-full transition-all duration-500',
                i === imgIndex ? 'w-4 h-1 bg-white/60' : 'w-1 h-1 bg-white/20'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
