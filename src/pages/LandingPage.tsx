import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Volume2,
  Mic,
  MessageSquare,
  Users,
  Compass,
  ArrowRight,
  ChevronDown,
  Globe,
  Radio,
  Flame,
  Layers,
  Heart,
  Repeat2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_USERS } from '@/constants/mockData';

// Unsplash curated atmospheric & real human portraits
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1600&q=80&auto=format&fit=crop',
];

const LIVE_CONVERSATION_PREVIEWS = [
  {
    topic: 'Life Experience',
    badge: 'Scruttin Asks',
    question: "What's something adulthood never prepared you for?",
    perspectivesCount: 48,
    countriesCount: 14,
    sampleQuote: '“You realize everyone is improvising at the exact same time.”',
    author: 'Amina Kalu',
    location: 'Lagos, Nigeria',
    hasVoice: true,
  },
  {
    topic: 'Philosophy & Society',
    badge: 'Statement',
    question: 'Privacy is no longer a right — it has become an expensive luxury.',
    perspectivesCount: 32,
    countriesCount: 9,
    sampleQuote: '“When convenience became the default currency, privacy was the first toll.”',
    author: 'Daniel Rocha',
    location: 'São Paulo, Brazil',
    hasVoice: true,
  },
  {
    topic: 'Modern Culture',
    badge: 'From the Crowd',
    question: 'What is something you stopped caring about as you got older?',
    perspectivesCount: 65,
    countriesCount: 19,
    sampleQuote: '“Explaining myself to people committed to misunderstanding me.”',
    author: 'Lena Weber',
    location: 'Berlin, Germany',
    hasVoice: false,
  },
  {
    topic: 'Human Connection',
    badge: 'Scruttin Asks',
    question: 'What makes a conversation unforgettable to you?',
    perspectivesCount: 41,
    countriesCount: 12,
    sampleQuote: '“When neither person feels the need to perform or impress.”',
    author: 'Joel Tetteh',
    location: 'Accra, Ghana',
    hasVoice: true,
  },
];

const PLATFORM_PILLARS = [
  {
    id: 'stream',
    title: 'The Vertical Stream',
    tagline: 'Swipe through raw human thoughts',
    description:
      'Immersive, full-screen cards revealing genuine perspectives one sentence or voice note at a time. No algorithmic doomscrolling or clickbait — just pure human answers.',
    icon: Radio,
    color: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/30',
    badge: 'Core Experience',
  },
  {
    id: 'dive',
    title: 'The Dive Matrix',
    tagline: 'Scruttin Asks, From the Crowd & Statements',
    description:
      'Explore deep questions seeded by the platform, authentic inquiries posted once daily by real people, or debate bold statements with structured agree/disagree stances.',
    icon: Compass,
    color: 'from-sky-500/20 to-blue-500/10',
    border: 'border-sky-500/30',
    badge: 'Deep Discovery',
  },
  {
    id: 'tagged',
    title: 'Tagged (The Other Side)',
    tagline: 'Tag along to be taken through someone’s world',
    description:
      'A dedicated original feed separate from the stream. Step into creators’ worlds: share personal reflections, attach photography snapshots, atmospheric GIFs, and custom mood stickers.',
    icon: Users,
    color: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/30',
    badge: 'Original Feed',
  },
];

const FAQ_ITEMS = [
  {
    q: 'What is a "Scrut"?',
    a: 'A Scrut is your spoken voice note or written perspective submitted in response to a question or statement. It is raw, personal, and focused on depth rather than virality.',
  },
  {
    q: 'How does Scruttin differ from traditional social media?',
    a: 'We stripped away vanity follower counts, superficial photos, and endless outrage algorithms. Instead, you get question-centric conversations, authentic audio answers, and ambient soundscapes.',
  },
  {
    q: 'Can I listen and read without creating an account?',
    a: 'Yes! The entire stream, question archive, and Tagged feed are freely browseable without an account. You only need to sign in when you want to answer, record voice notes, or tag creators.',
  },
  {
    q: 'What does "Tag Along" mean?',
    a: 'Tagging along is our thoughtful alternative to "following". It connects you directly to creators and voices whose perspectives resonate with you, building your custom Tagged feed.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);
  const [prevImgIndex, setPrevImgIndex] = useState<number | null>(null);
  const [activePreviewIdx, setActivePreviewIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Crossfade hero images smoothly every 6s
  useEffect(() => {
    const t = setInterval(() => {
      setPrevImgIndex(imgIndex);
      setImgIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(t);
  }, [imgIndex]);

  // Cycle preview card every 4.5s
  useEffect(() => {
    const t = setInterval(() => {
      setActivePreviewIdx((prev) => (prev + 1) % LIVE_CONVERSATION_PREVIEWS.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  const activePreview = LIVE_CONVERSATION_PREVIEWS[activePreviewIdx];

  return (
    <div className="min-h-screen bg-[#09090f] text-white selection:bg-white/20 selection:text-white font-sans">
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden border-b border-white/[0.08]">
        {/* Background Image Carousel with Atmospheric Gradient */}
        {HERO_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt="Scruttin global voices"
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 pointer-events-none select-none"
            style={{
              opacity: i === imgIndex ? 0.38 : i === prevImgIndex ? 0 : 0,
              zIndex: i === imgIndex ? 1 : i === prevImgIndex ? 0 : -1,
            }}
          />
        ))}

        {/* Ambient Dark Gradient Wash */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(9,9,15,0.7) 0%, rgba(9,9,15,0.4) 30%, rgba(9,9,15,0.85) 75%, rgba(9,9,15,1) 100%)',
          }}
        />

        {/* Global Floating Header */}
        <header className="relative z-20 max-w-6xl mx-auto w-full px-5 sm:px-8 pt-safe pt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.08] border border-white/15 backdrop-blur-md shadow-inner">
              <svg
                width="24"
                height="16"
                viewBox="0 0 24 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                className="text-white"
              >
                <path d="M1 3 Q4 1 7 3 Q10 5 13 3 Q16 1 19 3 Q21 4 23 3" />
                <path d="M1 8 Q4 6 7 8 Q10 10 13 8 Q16 6 19 8 Q21 9 23 8" />
                <path d="M1 13 Q4 11 7 13 Q10 15 13 13 Q16 11 19 13 Q21 14 23 13" />
              </svg>
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight flex items-center gap-1.5 leading-none">
                Scruttin
              </span>
              <span className="text-[10px] text-white/40 tracking-wider uppercase font-mono">
                Less showing. More saying.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="hero-signin-btn"
              onClick={() => navigate('/auth')}
              className="text-xs sm:text-sm font-medium text-white/70 hover:text-white px-3.5 py-2 rounded-xl hover:bg-white/8 transition-all"
            >
              Sign in
            </button>
            <button
              type="button"
              id="hero-open-app-btn"
              onClick={() => navigate('/stream')}
              className="text-xs sm:text-sm font-semibold bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Explore Stream</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </header>

        {/* Hero Central Pitch */}
        <div className="relative z-20 max-w-6xl mx-auto w-full px-5 sm:px-8 py-12 flex-1 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Column: Core Value Proposition */}
          <div className="max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-md mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-white/80">
                A text &amp; voice platform for real human perspective
              </span>
            </div>

            <h1 className="font-serif font-extrabold text-white text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] mb-5">
              The world isn&apos;t a feed. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
                It&apos;s a conversation.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/65 leading-relaxed mb-8 max-w-lg">
              Scruttin replaces vanity metrics, endless selfies, and rage algorithms with genuine questions, authentic voice notes, and deep perspectives from every corner of the planet.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
              <button
                type="button"
                id="hero-main-cta"
                onClick={() => navigate('/stream')}
                className="px-7 py-4 rounded-2xl bg-white text-black font-semibold text-[15px] tracking-tight hover:bg-white/90 active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2.5"
              >
                <span>Enter the Live Stream</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                id="hero-tagged-cta"
                onClick={() => navigate('/tagged')}
                className="px-6 py-4 rounded-2xl border border-white/20 bg-white/[0.04] text-white font-medium text-[15px] hover:border-white/40 hover:bg-white/[0.08] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Users size={16} className="text-emerald-400" />
                <span>Tagged Microblog</span>
              </button>
            </div>

            {/* Quick Micro Badges */}
            <div className="flex items-center flex-wrap gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> No account needed to listen
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> 1 question daily per person
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> Authentic voice recordings
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Live Card Preview */}
          <div className="w-full max-w-md">
            <div className="relative rounded-3xl border border-white/15 bg-white/[0.04] backdrop-blur-xl p-6 shadow-2xl overflow-hidden transition-all duration-300 hover:border-white/25">
              {/* Top Card Bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                    {activePreview.badge}
                  </span>
                  <span className="text-xs text-white/40 font-medium">#{activePreview.topic}</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400/90 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Now
                </span>
              </div>

              {/* The Active Question */}
              <h3 className="font-serif font-bold text-white text-xl sm:text-2xl leading-snug mb-4">
                “{activePreview.question}”
              </h3>

              {/* Sample Perspective Bubble */}
              <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-4 mb-4">
                <p className="text-sm font-sans text-white/90 italic leading-relaxed mb-3">
                  {activePreview.sampleQuote}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center font-bold text-[10px] text-white">
                      {activePreview.author.charAt(0)}
                    </div>
                    <span className="font-medium text-white/80">{activePreview.author}</span>
                  </div>
                  <span className="text-white/40 flex items-center gap-1 text-[11px]">
                    <Globe size={11} /> {activePreview.location}
                  </span>
                </div>
              </div>

              {/* Card Footer Metrics */}
              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/50">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={13} /> {activePreview.perspectivesCount} perspectives
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe size={13} /> {activePreview.countriesCount} countries
                  </span>
                </div>
                {activePreview.hasVoice && (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                    <Volume2 size={12} /> Audio included
                  </span>
                )}
              </div>
            </div>

            {/* Preview Carousel Dot Indicators */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {LIVE_CONVERSATION_PREVIEWS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePreviewIdx(idx)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    idx === activePreviewIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/20 hover:bg-white/40'
                  )}
                  aria-label={`Preview card ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Scroll Prompt */}
        <div className="relative z-20 pb-4 flex justify-center text-white/30 text-xs gap-1 items-center animate-bounce">
          <span>Scroll to learn how it works</span>
          <ChevronDown size={14} />
        </div>
      </section>

      {/* ===================== WHAT IS SCRUTTIN (3 PILLARS) ===================== */}
      <section className="py-20 px-5 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-white/40 mb-3">
            Architected for Depth
          </p>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-white tracking-tight leading-tight mb-4">
            Three interconnected ways to experience the world.
          </h2>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            Scruttin blends swipeable question cards, rich participatory prompt categorizations, and an open microblog for creator discourse.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLATFORM_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className={cn(
                  'relative rounded-3xl border bg-white/[0.025] p-7 flex flex-col justify-between transition-all duration-300 hover:bg-white/[0.05] hover:scale-[1.01]',
                  pillar.border
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/10 text-white">
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1.5">{pillar.title}</h3>
                  <p className="text-xs font-semibold text-white/45 uppercase tracking-wider mb-3">
                    {pillar.tagline}
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed">{pillar.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/8">
                  <button
                    type="button"
                    onClick={() => navigate(`/${pillar.id}`)}
                    className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1.5 group"
                  >
                    <span>Explore {pillar.title}</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== VOICES FROM THE WORLD (COMMUNITY) ===================== */}
      <section className="py-16 px-5 sm:px-8 border-y border-white/[0.08] bg-white/[0.015]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-white/40 mb-2">
                Global Network
              </p>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">
                Real voices across 40+ countries.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/tagged')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>See all creators on Tagged</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* User Showcase Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {MOCK_USERS.slice(0, 6).map((u) => (
              <div
                key={u.id}
                onClick={() => navigate('/tagged')}
                className="group cursor-pointer rounded-2xl border border-white/8 bg-white/[0.02] p-3 text-center transition-all duration-200 hover:bg-white/[0.06] hover:border-white/15"
              >
                <div className="relative mx-auto mb-2.5 w-12 h-12 rounded-full overflow-hidden border border-white/15 group-hover:scale-105 transition-transform">
                  <img src={u.avatar_url} alt={u.display_name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-semibold text-white text-xs truncate group-hover:underline">
                  {u.display_name}
                </h4>
                <p className="text-[10px] text-white/40 truncate mt-0.5">{u.city || u.country}</p>
                <div className="mt-2 text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/5 truncate">
                  {u.bio?.split('.')[0] || 'Voice Contributor'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FAQ SECTION ===================== */}
      <section className="py-20 px-5 sm:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-white/40 mb-2">
            Clear Answers
          </p>
          <h2 className="font-serif font-bold text-3xl text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-white text-sm sm:text-base hover:bg-white/[0.02]"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={16}
                    className={cn('text-white/40 transition-transform duration-200', isOpen && 'rotate-180 text-white')}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-white/60 leading-relaxed border-t border-white/5">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== FINAL CALL TO ACTION ===================== */}
      <section className="py-20 px-5 sm:px-8 border-t border-white/[0.08] bg-gradient-to-b from-white/[0.02] to-black text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-3xl bg-white/[0.08] border border-white/15 mb-6">
            <svg
              width="28"
              height="20"
              viewBox="0 0 24 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              className="text-white"
            >
              <path d="M1 3 Q4 1 7 3 Q10 5 13 3 Q16 1 19 3 Q21 4 23 3" />
              <path d="M1 8 Q4 6 7 8 Q10 10 13 8 Q16 6 19 8 Q21 9 23 8" />
              <path d="M1 13 Q4 11 7 13 Q10 15 13 13 Q16 11 19 13 Q21 14 23 13" />
            </svg>
          </div>

          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-white mb-4">
            Ready to hear what the world really thinks?
          </h2>
          <p className="text-white/60 text-sm sm:text-base mb-8 max-w-lg mx-auto">
            Step into the stream. Listen to voices from every continent. Share your perspective when you&apos;re ready.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              id="footer-join-btn"
              onClick={() => navigate('/stream')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-white/90 active:scale-95 transition-all shadow-xl"
            >
              Enter the stream
            </button>
            <button
              type="button"
              id="footer-auth-btn"
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/20 text-white font-medium text-sm hover:border-white/40 hover:bg-white/5 active:scale-95 transition-all"
            >
              Create free account
            </button>
          </div>

          <p className="text-white/30 text-xs mt-12">
            &copy; {new Date().getFullYear()} Scruttin &mdash; Less showing. More saying. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
