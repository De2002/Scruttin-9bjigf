import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Volume2,
  Mic2,
  MessageSquare,
  Users,
  Compass,
  ArrowRight,
  ChevronDown,
  Radio,
  Flame,
  CheckCircle2,
  Sparkles,
  Play,
  Pause,
  Clock,
  HelpCircle,
  Feather,
  Globe,
  Quote,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Atmospheric Unsplash imagery for mood backgrounds
const HERO_BACKGROUND =
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&q=80&auto=format&fit=crop';

const SAMPLE_QUESTIONS = [
  {
    topic: 'Life Experience',
    badge: 'Scruttin Asks',
    question: "What's something adulthood never prepared you for?",
    sampleAnswer:
      "You realize almost everyone is improvising at the exact same time. Nobody is as in control as they appear on the outside.",
    hasVoice: true,
    author: 'Founding Voice',
    city: 'Kampala',
    path: '/dive',
  },
  {
    topic: 'Society & Culture',
    badge: 'Statement',
    question: 'Privacy is no longer a default right — it has become a luxury item.',
    sampleAnswer:
      "When convenience became the primary currency of the digital age, personal quiet and anonymity became the first tolls.",
    hasVoice: true,
    author: 'Early Contributor',
    city: 'Nairobi',
    path: '/dive',
  },
  {
    topic: 'Mind & Habits',
    badge: 'From the Crowd',
    question: 'What is something you stopped caring about as you grew older?',
    sampleAnswer:
      "Trying to prove myself in rooms where my presence was already questioned. Energy is too finite to spend on performative validation.",
    hasVoice: false,
    author: 'Open Perspective',
    city: 'London',
    path: '/dive',
  },
];

const PLATFORM_PILLARS = [
  {
    id: 'stream',
    title: 'The Vertical Stream',
    tagline: 'Swipe card by card',
    description:
      'Immersive, single-thought cards revealing genuine perspectives one voice note or reflection at a time. No infinite doomscrolling or clickbait — just human answers.',
    icon: Radio,
    color: 'border-amber-500/30 bg-amber-500/[0.04]',
    link: '/stream',
    cta: 'Open the Stream',
  },
  {
    id: 'dive',
    title: 'The Dive Matrix',
    tagline: 'Questions, Crowd Takes & Statements',
    description:
      'Explore deep prompts seeded daily, submit inquiries to the crowd, or debate bold statements with structured agree/disagree stances.',
    icon: Compass,
    color: 'border-sky-500/30 bg-sky-500/[0.04]',
    link: '/dive',
    cta: 'Browse Conversations',
  },
  {
    id: 'tagged',
    title: 'Tagged (The Original Feed)',
    tagline: 'Tag along to creator journeys',
    description:
      'A dedicated space separate from the rapid stream. Share personal reflections, interactive community polls, and original media.',
    icon: Users,
    color: 'border-emerald-500/30 bg-emerald-500/[0.04]',
    link: '/tagged',
    cta: 'Explore Tagged',
  },
];

const EARLY_REASONS = [
  {
    icon: Feather,
    title: 'Help shape the culture',
    description:
      'The earliest voices define what a community feels like. We are building a space characterized by curiosity and depth rather than cynicism.',
  },
  {
    icon: Sparkles,
    title: 'Claim your handle early',
    description:
      'Secure your personal username and establish your profile before the platform opens up to the broader web.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Zero outrage algorithms',
    description:
      'There is no algorithmic feed engineered to anger you or maximize screen time. Conversations are chronologically clean and thoughtful.',
  },
  {
    icon: Globe,
    title: 'No friction to explore',
    description:
      'You do not need an account or email to browse. Jump straight into the stream, read takes, and listen to voice notes immediately.',
  },
];

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const FAQ_ITEMS = [
  {
    q: "We notice there aren't many users yet — what is Scruttin's story?",
    a: "You're here right at the beginning! Scruttin was created as an antidote to modern social feeds that reward outrage, endless selfies, and algorithmic doomscrolling. We're launching intentionally small, welcoming curious thinkers and early voices to start the first genuine conversations.",
  },
  {
    q: 'What is a "Scrut"?',
    a: 'A Scrut is your response to a question or statement. It can be a short written reflection (up to 300 characters) or a raw voice note (up to 60 seconds). It is concise, direct, and focused on perspective rather than performance.',
  },
  {
    q: 'Can I listen and read without creating an account?',
    a: 'Yes! The entire stream, question archive, and Tagged feed are freely browseable without an account. You only need to sign in when you want to post your own answers, vote in community polls, or tag creators.',
  },
  {
    q: 'How does the voice recording work?',
    a: 'Tap the voice option on any answer card or conversation, press record, and speak your mind. It keeps conversations warm, natural, and human — just like talking to someone across a table.',
  },
  {
    q: 'How can I support or contribute as an early user?',
    a: 'Answer a question that sparks your interest, state a bold claim on the Dive page, or invite a friend who enjoys thoughtful discussions. Your early presence genuinely shapes the soul of this project.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const activePrompt = SAMPLE_QUESTIONS[selectedPromptIdx];

  const toggleSampleAudio = () => {
    setIsPlayingAudio((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#09090f] text-white selection:bg-white/20 selection:text-white font-sans">
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden border-b border-white/[0.08]">
        {/* Atmospheric Background with Deep Tint */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20"
          style={{ backgroundImage: `url(${HERO_BACKGROUND})` }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(9,9,15,0.75) 0%, rgba(9,9,15,0.85) 40%, rgba(9,9,15,0.98) 85%, rgba(9,9,15,1) 100%)',
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
              <span className="text-[10px] text-white/45 tracking-wider uppercase font-mono">
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
        <div className="relative z-20 max-w-6xl mx-auto w-full px-5 sm:px-8 py-10 sm:py-14 flex-1 flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Column: Honest, Grounded Proposition */}
          <div className="max-w-xl text-left">
            {/* Early Launch Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/[0.08] border border-amber-400/25 backdrop-blur-md mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-amber-200/90 tracking-wide">
                Early Days · Help us start the conversation
              </span>
            </div>

            <h1 className="font-serif font-extrabold text-white text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12] mb-5">
              The web doesn&apos;t need another feed. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
                It needs real human voices.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 max-w-lg font-normal">
              We are brand new. No algorithms engineering your outrage, no follower counts, and no vanity filters. Just simple questions, raw voice notes, and honest perspectives.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8">
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
                id="hero-auth-cta"
                onClick={() => navigate('/auth')}
                className="px-6 py-4 rounded-2xl border border-white/20 bg-white/[0.04] text-white font-medium text-[15px] hover:border-white/40 hover:bg-white/[0.08] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Feather size={16} className="text-amber-300" />
                <span>Join as a Founding Voice</span>
              </button>
            </div>

            {/* Honest Micro Highlights */}
            <div className="flex items-center flex-wrap gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> Free &amp; open to browse
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> Spoken audio or short text
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> 1 question daily per person
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Prompt Showcase */}
          <div className="w-full max-w-md">
            {/* Prompt Selector Pills */}
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar pb-1">
              {SAMPLE_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPromptIdx(idx);
                    setIsPlayingAudio(false);
                  }}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0',
                    idx === selectedPromptIdx
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10'
                  )}
                >
                  {q.topic}
                </button>
              ))}
            </div>

            {/* Interactive Preview Card */}
            <div className="relative rounded-3xl border border-white/15 bg-white/[0.04] backdrop-blur-xl p-6 shadow-2xl overflow-hidden transition-all duration-300 hover:border-white/25">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                    {activePrompt.badge}
                  </span>
                  <span className="text-xs text-white/40 font-medium">Daily Prompt</span>
                </div>
                <span className="text-[11px] text-amber-300 font-mono flex items-center gap-1">
                  <Clock size={11} /> Open for answers
                </span>
              </div>

              {/* The Question */}
              <h3 className="font-serif font-bold text-white text-xl sm:text-2xl leading-snug mb-5">
                “{activePrompt.question}”
              </h3>

              {/* Sample Response Box */}
              <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-4 mb-5">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-[10px] text-black">
                      {activePrompt.author.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-white/80">{activePrompt.author}</span>
                    <span className="text-[10px] text-white/40">· {activePrompt.city}</span>
                  </div>

                  {activePrompt.hasVoice && (
                    <button
                      type="button"
                      onClick={toggleSampleAudio}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all',
                        isPlayingAudio
                          ? 'bg-emerald-500 text-black shadow-sm'
                          : 'bg-white/10 text-emerald-300 hover:bg-white/15 border border-white/10'
                      )}
                    >
                      {isPlayingAudio ? <Pause size={10} /> : <Play size={10} />}
                      <span>{isPlayingAudio ? 'Listening...' : 'Play voice note'}</span>
                    </button>
                  )}
                </div>

                <p className="text-sm font-sans text-white/85 italic leading-relaxed">
                  “{activePrompt.sampleAnswer}”
                </p>

                {isPlayingAudio && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2 text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-mono text-[11px]">Audio preview active · Raw voice recording</span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div className="text-xs text-white/40">
                  <span>Have a perspective on this?</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/stream')}
                  className="text-xs font-semibold text-white hover:text-amber-300 flex items-center gap-1.5 transition-colors group"
                >
                  <span>Answer this question</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Scroll Prompt */}
        <div className="relative z-20 pb-4 flex justify-center text-white/30 text-xs gap-1 items-center">
          <span>Explore how Scruttin works below</span>
          <ChevronDown size={14} className="animate-bounce" />
        </div>
      </section>

      {/* ===================== WHY START NOW (FOUNDING COMMUNITY) ===================== */}
      <section className="py-20 px-5 sm:px-8 max-w-6xl mx-auto border-b border-white/[0.08]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/60 uppercase tracking-wider mb-3">
            <Sparkles size={12} className="text-amber-400" />
            <span>The Ground Floor</span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-white tracking-tight leading-tight mb-4">
            Why join a platform on day one?
          </h2>
          <p className="text-white/65 text-sm sm:text-base leading-relaxed">
            The early days of any community are rare. Before algorithms take over, there is room for authentic connection and honest discourse.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {EARLY_REASONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 hover:bg-white/[0.05] hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-11 w-11 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-300 mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-white text-base mb-2">{item.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== THE THREE SPACES ===================== */}
      <section className="py-20 px-5 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-white/40 mb-3">
            Designed for Clarity
          </p>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-white tracking-tight leading-tight mb-4">
            Three simple spaces to explore.
          </h2>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            Everything in Scruttin is structured around questions, audio answers, and creators.
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
                  'relative rounded-3xl border p-7 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01]',
                  pillar.color
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.08] border border-white/15 text-white">
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                      Space {pillar.id === 'stream' ? '01' : pillar.id === 'dive' ? '02' : '03'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1.5">{pillar.title}</h3>
                  <p className="text-xs font-semibold text-white/45 uppercase tracking-wider mb-3">
                    {pillar.tagline}
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed">{pillar.description}</p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => navigate(pillar.link)}
                    className="text-xs font-semibold text-white hover:text-amber-300 flex items-center gap-1.5 transition-colors group"
                  >
                    <span>{pillar.cta}</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== THE MANIFESTO ===================== */}
      <section className="py-20 px-5 sm:px-8 border-y border-white/[0.08] bg-white/[0.015]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Quote className="h-8 w-8 mx-auto text-amber-400/60 mb-3" />
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              A quieter web for genuine reflection.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* The Performance Web */}
            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/[0.02] p-6 sm:p-7">
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold block mb-3">
                The Performance Web
              </span>
              <ul className="space-y-3 text-sm text-white/60">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span> Endless visual comparison and curated selfies
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span> Algorithms rewarded by conflict and rage
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span> Follower counts dictating who gets heard
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span> Infinite scroll engineered to keep you hooked
                </li>
              </ul>
            </div>

            {/* The Scruttin Way */}
            <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/[0.03] p-6 sm:p-7">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-3">
                The Scruttin Way
              </span>
              <ul className="space-y-3 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Raw voice notes and 300-character thoughts
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Question-driven discussions that provoke depth
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Perspectives judged on content, not clout
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Ambient pace that lets you pause and listen
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FAQ SECTION ===================== */}
      <section className="py-20 px-5 sm:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-white/40 mb-2">
            Honest Answers
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
                    className={cn('text-white/40 transition-transform duration-200 shrink-0', isOpen && 'rotate-180 text-white')}
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
            Be one of our first voices.
          </h2>
          <p className="text-white/60 text-sm sm:text-base mb-8 max-w-lg mx-auto">
            Browse without an account or claim your handle to answer today&apos;s prompts. Every great space begins with a single conversation.
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
              Claim your handle
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
