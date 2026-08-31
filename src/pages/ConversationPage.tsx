import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn, formatCount } from '@/lib/utils';
import { useStream } from '@/stores/streamContext';
import { usePreferences } from '@/stores/preferencesStore';
import ScrutCard from '@/components/features/ScrutCard';
import ScrutDetailSheet from '@/components/features/ScrutDetailSheet';
import ComposeModal from '@/components/features/ComposeModal';
import AtmosphereControls from '@/components/layout/AtmosphereControls';
import type { ConversationStarter, Scrut } from '@/types';

const SWIPE_THRESHOLD = 52;
type Phase = 'idle' | 'exiting' | 'entering';

function mapUser(profile: Record<string, unknown>) {
  return {
    id: (profile.id as string) ?? '',
    display_name: (profile.display_name as string) ?? 'Anonymous',
    avatar_url: (profile.avatar_url as string) ?? '',
    country: (profile.country as string) ?? '',
    city: profile.city as string | undefined,
    bio: profile.bio as string | undefined,
    website: profile.website as string | undefined,
    twitter: profile.twitter as string | undefined,
    instagram: profile.instagram as string | undefined,
  };
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [composeOpen, setComposeOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [detailScrut, setDetailScrut] = useState<Scrut | null>(null);
  const [conversation, setConversation] = useState<ConversationStarter | null>(null);
  const [scruts, setScruts] = useState<Scrut[]>([]);
  const [loading, setLoading] = useState(true);
  const { pinned, togglePin } = useStream();
  const { autoPlayVoice } = usePreferences();

  const advancing = useRef(false);
  const touchStartY = useRef(0);
  const mouseStartY = useRef(0);
  const isDragging = useRef(false);
  const hasMoved = useRef(false);

  // Track the currently active scrut's id to force re-mount on advance (for autoplay)
  const currentScrutId = scruts[index]?.id;

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    const { data: conv } = await supabase
      .from('conversations')
      .select('*, user:user_id(id, display_name, avatar_url, country, city, bio, website, twitter, instagram)')
      .eq('id', id)
      .single();

    if (conv) {
      setConversation({
        id: conv.id,
        user_id: conv.user_id,
        user: conv.user ? mapUser(conv.user as Record<string, unknown>) : { id: '', display_name: 'Scruttin', avatar_url: '', country: '' },
        type: conv.type,
        body: conv.body,
        topic: conv.topic ?? '',
        created_at: conv.created_at,
        scrut_count: conv.scrut_count ?? 0,
        country_count: conv.country_count ?? 0,
        is_platform: conv.is_platform,
        circulation_score: 0,
      });
    }

    const { data: scrutData } = await supabase
      .from('scruts')
      .select('*, user:user_id(id, display_name, avatar_url, country, city, bio, website, twitter, instagram), attachment_url')
      .eq('conversation_id', id)
      .eq('is_reported', false)
      .order('created_at', { ascending: true });

    setScruts(
      (scrutData ?? []).map((s: Record<string, unknown>) => ({
        id: s.id as string,
        user: mapUser(s.user as Record<string, unknown>),
        conversation_id: s.conversation_id as string,
        type: s.type as 'text' | 'voice',
        text: s.text as string | undefined,
        audio_url: s.audio_url as string | undefined,
        audio_duration: s.audio_duration as number | undefined,
        position: s.position as 'agree' | 'unsure' | 'disagree' | null,
        resonate_count: (s.resonate_count as number) ?? 0,
        resonated_by_me: false,
        created_at: s.created_at as string,
        attachment_url: s.attachment_url as string | undefined,
      }))
    );

    setLoading(false);
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  // 30-second polling — refresh conversation counts + resonate counts
  useEffect(() => {
    if (!id) return;
    const timer = setInterval(async () => {
      // Refresh conversation counts
      const { data: conv } = await supabase
        .from('conversations')
        .select('scrut_count, country_count')
        .eq('id', id)
        .single();
      if (conv) {
        setConversation(prev => prev
          ? { ...prev, scrut_count: (conv as {scrut_count:number;country_count:number}).scrut_count, country_count: (conv as {scrut_count:number;country_count:number}).country_count }
          : prev
        );
      }
      // Refresh resonate counts on scruts
      setScruts(prevScruts => {
        if (prevScruts.length === 0) return prevScruts;
        const ids = prevScruts.map(s => s.id);
        supabase.from('scruts').select('id, resonate_count').in('id', ids)
          .then(({ data }) => {
            if (!data) return;
            setScruts(prev => prev.map(s => {
              const u = (data as {id:string;resonate_count:number}[]).find(d => d.id === s.id);
              return u ? { ...s, resonate_count: u.resonate_count } : s;
            }));
          });
        return prevScruts;
      });
    }, 30000);
    return () => clearInterval(timer);
  }, [id]);

  const isPinned = pinned.includes(conversation?.id ?? '');
  const scrut = scruts[index];

  const advance = useCallback(() => {
    if (advancing.current || scruts.length <= 1) return;
    advancing.current = true;
    setPhase('exiting');
    setTimeout(() => {
      setIndex(prev => (prev + 1) % scruts.length);
      setPhase('entering');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase('idle');
          advancing.current = false;
        });
      });
    }, 380);
  }, [scruts.length]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; hasMoved.current = false; };
  const onTouchMove = (e: React.TouchEvent) => { if (Math.abs(e.touches[0].clientY - touchStartY.current) > 8) hasMoved.current = true; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (!hasMoved.current || dy >= -SWIPE_THRESHOLD) return;
    advance();
  };
  const onMouseDown = (e: React.MouseEvent) => { mouseStartY.current = e.clientY; isDragging.current = true; hasMoved.current = false; };
  const onMouseMove = (e: React.MouseEvent) => { if (!isDragging.current) return; if (Math.abs(e.clientY - mouseStartY.current) > 8) hasMoved.current = true; };
  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dy = e.clientY - mouseStartY.current;
    if (!hasMoved.current || dy >= -SWIPE_THRESHOLD) return;
    advance();
  };

  if (loading || !conversation) {
    return (
      <div className="flex items-center justify-center h-screen text-white/40">
        {loading ? (
          <img src="/favicon.png" alt="" className="w-8 h-8 opacity-30 animate-pulse" />
        ) : (
          <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white flex items-center gap-2">
            <ArrowLeft size={16} /> Back
          </button>
        )}
      </div>
    );
  }

  const contentAnim = cn(
    phase === 'exiting' && 'scrut-exit-up',
    phase === 'entering' && 'scrut-enter-below',
    phase === 'idle' && 'opacity-100 translate-y-0',
  );

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden pb-16">
      {/* Compact detail toolbar; the conversation prompt is already represented by the Scrut card below. */}
      <div className="shrink-0 z-30 relative flex items-center justify-between px-4 pt-safe pt-3 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm"
          onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}
        >
          <ArrowLeft size={15} /><span className="text-xs">Back</span>
        </button>
        <div className="flex items-center gap-2" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
          <AtmosphereControls />
          <button
            onClick={() => togglePin(conversation.id)}
            className={cn(
              'flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border transition-all',
              isPinned ? 'text-amber-300 border-amber-400/40 bg-amber-400/10' : 'text-white/25 border-white/10 hover:text-white/50'
            )}
          >
            <Pin size={10} fill={isPinned ? 'currentColor' : 'none'} />
            {isPinned ? 'Pinned' : 'Pin'}
          </button>
        </div>
      </div>

      {/* Scrut zone */}
      <div
        className="flex-1 relative overflow-hidden"
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
        style={{ userSelect: 'none', cursor: 'default' }}
      >
        {scruts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/30 pb-8">
            <p className="text-3xl mb-3">🎙</p>
            <p className="font-medium mb-1 text-white/50">No scruts yet</p>
            <p className="text-sm">Be the first to answer</p>
          </div>
        ) : (
          <div key={currentScrutId} className={cn('absolute inset-0 flex flex-col justify-center px-5 pb-6', contentAnim)}>
            {scrut && (
              <ScrutCard
                scrut={scrut}
                showPosition={conversation.type === 'statement'}
                onAvatarClick={(s) => setDetailScrut(s)}
                autoPlayVoice={autoPlayVoice}
              />
            )}
            {scruts.length > 1 && (
              <div className="mt-6 flex items-center justify-center gap-1 text-white/20 text-[11px] pointer-events-none select-none">
                <span>↑</span><span className="tracking-wide">swipe for next</span>
              </div>
            )}
          </div>
        )}

        {scruts.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none z-10">
            {scruts.map((_, i) => (
              <span key={i} className={cn('rounded-full transition-all duration-300', i === index ? 'w-4 h-1 bg-white/50' : 'w-1 h-1 bg-white/15')} />
            ))}
          </div>
        )}
      </div>

      {/* Answer action — floating above the bottom navigation */}
      <button
        type="button"
        onClick={() => setComposeOpen(true)}
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        className="fixed bottom-20 right-4 z-40 flex min-h-14 max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-white/15 bg-white px-5 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:bottom-6 sm:right-6"
      >
        <span className="text-lg leading-none">+</span>
        {conversation.type === 'statement' ? 'Scrut your response' : 'Scrut your answer'}
      </button>

      {composeOpen && (
        <ComposeModal
          onClose={() => setComposeOpen(false)}
          defaultMode={conversation.type === 'statement' ? 'statement' : 'question'}
          contextConversation={conversation}
          onPosted={() => { setTimeout(() => loadData(), 400); }}
        />
      )}

      {detailScrut && (
        <ScrutDetailSheet scrut={detailScrut} onClose={() => setDetailScrut(null)} />
      )}
    </div>
  );
}
