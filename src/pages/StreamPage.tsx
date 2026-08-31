import { useState, useRef, useCallback, useEffect } from 'react';
import { Globe, Mic2 } from 'lucide-react';
import { cn, formatCount } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useStream } from '@/stores/streamContext';
import { usePreferences } from '@/stores/preferencesStore';
import ScrutCard from '@/components/features/ScrutCard';
import StatementVote from '@/components/features/StatementVote';
import ScrutDetailSheet from '@/components/features/ScrutDetailSheet';
import AtmosphereControls from '@/components/layout/AtmosphereControls';
import ComposeModal from '@/components/features/ComposeModal';
import SponsoredScrutCard from '@/components/features/SponsoredScrutCard';
import AmbientAd from '@/components/features/AmbientAd';
import { useAdSession } from '@/hooks/useAdSession';
import type { ConversationStarter, Scrut } from '@/types';
import type { AdCampaign } from '@/hooks/useAdSession';

const SWIPE_THRESHOLD = 52;
type Phase = 'idle' | 'exiting' | 'entering';

interface StreamItem {
  conversation: ConversationStarter;
  scrut: Scrut | null;
  isHeader: boolean;
}

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

const PLATFORM_USER = {
  id: '',
  display_name: 'Scruttin',
  avatar_url: '',
  country: '',
};

function SectionBadge({ conversation }: { conversation: ConversationStarter }) {
  if (conversation.is_platform) {
    return (
      <div className="flex items-center gap-1.5">
        <svg width="14" height="10" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-white/50">
          <path d="M1 3 Q4 1 7 3 Q10 5 13 3 Q16 1 19 3 Q21 4 23 3" />
          <path d="M1 8 Q4 6 7 8 Q10 10 13 8 Q16 6 19 8 Q21 9 23 8" />
          <path d="M1 13 Q4 11 7 13 Q10 15 13 13 Q16 11 19 13 Q21 14 23 13" />
        </svg>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">Scruttin Asks</span>
      </div>
    );
  }
  if (conversation.type === 'statement') {
    return (
      <div className="flex items-center gap-1.5">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400/70">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-400/60">Statement</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-sky-400/70">
        <circle cx="9" cy="7" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <circle cx="17" cy="8" r="2.5" /><path d="M14 20c.5-2.5 2-4.5 4-5" />
      </svg>
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-400/60">From the Crowd</span>
      {conversation.user?.display_name && (
        <span className="text-white/25 text-[10px]">· {conversation.user.display_name}</span>
      )}
    </div>
  );
}

export default function StreamPage() {
  const [streamItems, setStreamItems] = useState<StreamItem[]>([]);
  const [loadingStream, setLoadingStream] = useState(true);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [composeOpen, setComposeOpen] = useState(false);
  const [detailScrut, setDetailScrut] = useState<Scrut | null>(null);
  const [currentSponsoredAd, setCurrentSponsoredAd] = useState<AdCampaign | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | undefined>();

  const advancing = useRef(false);
  const touchStartY = useRef(0);
  const touchStartedInAtmosphere = useRef(false);
  const mouseStartY = useRef(0);
  const isDragging = useRef(false);

  const { pinned, togglePin } = useStream();
  const { autoPlayVoice } = usePreferences();
  const { activeAmbientCampaign, onScrutViewed, trackEvent } = useAdSession(currentTopic);

  useEffect(() => { loadStream(); }, []);

  // 30-second polling — refresh counts + resonate counts without full reload
  useEffect(() => {
    const timer = setInterval(async () => {
      if (streamItems.length === 0) return;
      const convIds = [...new Set(streamItems.map(i => i.conversation.id))];
      const { data: convData } = await supabase
        .from('conversations')
        .select('id, scrut_count, country_count')
        .in('id', convIds);
      if (convData) {
        setStreamItems(prev => prev.map(item => {
          const u = (convData as { id: string; scrut_count: number; country_count: number }[]).find(d => d.id === item.conversation.id);
          if (!u) return item;
          return { ...item, conversation: { ...item.conversation, scrut_count: u.scrut_count, country_count: u.country_count } };
        }));
      }
      const scrutIds = streamItems.filter(i => i.scrut).map(i => i.scrut!.id);
      if (scrutIds.length > 0) {
        const { data: sData } = await supabase
          .from('scruts')
          .select('id, resonate_count')
          .in('id', scrutIds);
        if (sData) {
          setStreamItems(prev => prev.map(item => {
            if (!item.scrut) return item;
            const u = (sData as { id: string; resonate_count: number }[]).find(s => s.id === item.scrut!.id);
            if (!u) return item;
            return { ...item, scrut: { ...item.scrut!, resonate_count: u.resonate_count } };
          }));
        }
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [streamItems]);

  const loadStream = async () => {
    setLoadingStream(true);

    const { data: conversations, error: convErr } = await supabase
      .from('conversations')
      .select(`id, type, body, topic, is_platform, scrut_count, country_count, created_at, user_id,
        user:user_id(id, display_name, avatar_url, country, city, bio, website, twitter, instagram)`)
      .eq('is_reported', false)
      .not('body', 'is', null)
      .neq('body', '')
      .order('created_at', { ascending: false })
      .limit(40);

    if (convErr) console.error('Stream load error:', convErr);

    if (!conversations || conversations.length === 0) {
      setStreamItems([]);
      setLoadingStream(false);
      return;
    }

    const convIds = conversations.map((c: Record<string, unknown>) => c.id as string);
    const { data: scruts } = await supabase
      .from('scruts')
      .select(`id, conversation_id, type, text, audio_url, audio_duration, position, resonate_count, attachment_url, created_at,
        user:user_id(id, display_name, avatar_url, country, city, bio, website, twitter, instagram)`)
      .in('conversation_id', convIds)
      .eq('is_reported', false)
      .order('created_at', { ascending: true });

    const scrutMap: Record<string, Scrut[]> = {};
    (scruts ?? []).forEach((s: Record<string, unknown>) => {
      const cid = s.conversation_id as string;
      if (!scrutMap[cid]) scrutMap[cid] = [];
      scrutMap[cid].push({
        id: s.id as string,
        user: mapUser(s.user as Record<string, unknown>),
        conversation_id: cid,
        type: s.type as 'text' | 'voice',
        text: s.text as string | undefined,
        audio_url: s.audio_url as string | undefined,
        audio_duration: s.audio_duration as number | undefined,
        position: s.position as 'agree' | 'unsure' | 'disagree' | null,
        resonate_count: (s.resonate_count as number) ?? 0,
        resonated_by_me: false,
        created_at: s.created_at as string,
        attachment_url: s.attachment_url as string | undefined,
      });
    });

    const items: StreamItem[] = [];
    conversations.forEach((conv: Record<string, unknown>) => {
      const rawUser = conv.user as Record<string, unknown> | null;
      const conversation: ConversationStarter = {
        id: conv.id as string,
        user_id: conv.user_id as string,
        user: rawUser ? mapUser(rawUser) : PLATFORM_USER,
        type: conv.type as 'question' | 'statement' | 'open',
        body: conv.body as string,
        topic: (conv.topic as string) ?? '',
        created_at: conv.created_at as string,
        scrut_count: (conv.scrut_count as number) ?? 0,
        country_count: (conv.country_count as number) ?? 0,
        is_platform: conv.is_platform as boolean,
        circulation_score: 0,
      };
      items.push({ conversation, scrut: null, isHeader: true });
      (scrutMap[conv.id as string] ?? []).forEach(s => {
        items.push({ conversation, scrut: s, isHeader: false });
      });
    });

    setStreamItems(items);
    setLoadingStream(false);
  };

  const current = streamItems[index];

  useEffect(() => {
    if (current?.conversation?.topic) setCurrentTopic(current.conversation.topic);
  }, [index, current]);

  const advance = useCallback(() => {
    if (advancing.current) return;
    advancing.current = true;

    // Check if we should inject a sponsored scrut
    if (current && !current.isHeader) {
      const sponsored = onScrutViewed();
      if (sponsored) {
        setCurrentSponsoredAd(sponsored);
        trackEvent(sponsored.id, 'sponsored_impression');
        advancing.current = false;
        return;
      }
    }

    if (currentSponsoredAd) setCurrentSponsoredAd(null);

    setPhase('exiting');
    setTimeout(() => {
      setIndex(prev => {
        if (prev >= streamItems.length - 1) return prev;
        return prev + 1;
      });
      setPhase('entering');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase('idle');
          advancing.current = false;
        });
      });
    }, 360);
  }, [index, streamItems.length, current, currentSponsoredAd, onScrutViewed, trackEvent]);

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartY.current = touch.clientY;
    const target = e.target instanceof Element ? e.target : null;
    touchStartedInAtmosphere.current = Boolean(
      target?.closest('[data-atmosphere-controls]')
      || (touch.clientY <= 100 && touch.clientX >= window.innerWidth - 180)
    );
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (dy < -SWIPE_THRESHOLD && !touchStartedInAtmosphere.current) advance();
    touchStartedInAtmosphere.current = false;
  };
  const onMouseDown = (e: React.MouseEvent) => { mouseStartY.current = e.clientY; isDragging.current = true; };
  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dy = e.clientY - mouseStartY.current;
    if (dy < -SWIPE_THRESHOLD) advance();
  };

  const contentAnim = cn(
    phase === 'exiting' && 'scrut-exit-up',
    phase === 'entering' && 'scrut-enter-below',
    phase === 'idle' && 'opacity-100 translate-y-0',
  );

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden pb-16"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      style={{ userSelect: 'none', cursor: 'default' }}
    >
      {/* Ambient Ad layer — environment, not stream */}
      {activeAmbientCampaign && (
        <AmbientAd
          campaign={activeAmbientCampaign}
          onImpression={(dur) => {
            if (dur === 0) trackEvent(activeAmbientCampaign.id, 'ambient_impression');
            else trackEvent(activeAmbientCampaign.id, 'ambient_visible_duration', dur);
          }}
          onClickThrough={() => trackEvent(activeAmbientCampaign.id, 'ambient_click')}
        />
      )}

      {/* Top bar */}
      <div className="shrink-0 z-30 flex items-center justify-between px-5 pt-safe pt-3 pb-2">
        <div className="flex items-center gap-2">
          {/* S logo */}
          <img src="/favicon.png" alt="Scruttin" className="w-5 h-5 object-contain opacity-80" />
          <span className="text-white font-bold text-[15px] tracking-tight">Stream</span>
        </div>
        <span onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
          <AtmosphereControls />
        </span>
      </div>

      {/* Swipe zone */}
      <div className="flex-1 relative overflow-hidden">
        {loadingStream ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 text-white/30">
              <img src="/favicon.png" alt="" className="w-6 h-6 opacity-30 animate-pulse" />
              <span className="text-xs">Loading stream…</span>
            </div>
          </div>
        ) : streamItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/30 pb-16">
            <p className="text-3xl mb-3">🎙</p>
            <p className="font-medium mb-1 text-white/50">Stream is quiet</p>
            <p className="text-sm">Be the first to start a conversation</p>
          </div>
        ) : currentSponsoredAd ? (
          <div className="absolute inset-0 flex flex-col justify-center px-5">
            <SponsoredScrutCard
              campaign={currentSponsoredAd}
              onViewDuration={(sec) => trackEvent(currentSponsoredAd.id, 'sponsored_view_duration', sec)}
              onSwipeAway={() => {
                setCurrentSponsoredAd(null);
                advancing.current = false;
                advance();
              }}
              onCTAClick={() => trackEvent(currentSponsoredAd.id, 'sponsored_click')}
              onResonate={() => trackEvent(currentSponsoredAd.id, 'sponsored_resonate')}
              onResponseStarted={() => trackEvent(currentSponsoredAd.id, 'sponsored_response_started')}
            />
          </div>
        ) : current ? (
          <div key={index} className={cn('absolute inset-0 flex flex-col justify-center px-5', contentAnim)}>
            {current.isHeader ? (
              <ConversationCard
                conversation={current.conversation}
                isPinned={pinned.includes(current.conversation.id)}
                onPin={() => togglePin(current.conversation.id)}
                onNext={advance}
              />
            ) : (
              <ScrutView
                conversation={current.conversation}
                scrut={current.scrut!}
                streamIndex={index}
                autoPlayVoice={autoPlayVoice}
                onAvatarClick={(s) => setDetailScrut(s)}
              />
            )}
          </div>
        ) : null}

        {!loadingStream && streamItems.length > 0 && (
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1 text-white/18 text-[10px] pointer-events-none select-none">
            <span>↑</span>
            <span className="tracking-wide">swipe</span>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setComposeOpen(true)}
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        className={cn(
          'absolute bottom-20 right-5 z-40',
          'px-4 h-10 rounded-full',
          'glass border border-white/12 text-white/60 hover:text-white/90 font-semibold text-sm',
          'hover:border-white/25 transition-all duration-200 shadow-lg shadow-black/30'
        )}
      >
        {current?.isHeader
          ? (current.conversation.type === 'statement' ? 'State' : 'Ask')
          : 'Scrut'}
      </button>

      {composeOpen && current && (
        <ComposeModal
          onClose={() => setComposeOpen(false)}
          defaultMode={current.conversation.type === 'statement' ? 'statement' : current.conversation.type === 'open' ? 'open' : 'question'}
          contextConversation={!current.isHeader ? current.conversation : undefined}
          onPosted={() => { setTimeout(() => loadStream(), 500); }}
        />
      )}

      {detailScrut && (
        <ScrutDetailSheet scrut={detailScrut} onClose={() => setDetailScrut(null)} />
      )}
    </div>
  );
}

function ConversationCard({
  conversation, isPinned, onPin, onNext,
}: {
  conversation: ConversationStarter;
  isPinned: boolean;
  onPin: () => void;
  onNext: () => void;
}) {
  const topicColor: Record<string, string> = {
    Life: 'text-violet-400', Family: 'text-rose-400', Culture: 'text-orange-400',
    Relationships: 'text-pink-400', Work: 'text-blue-400', Money: 'text-emerald-400',
    Technology: 'text-cyan-400', Society: 'text-indigo-400', Fun: 'text-yellow-400',
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-4"><SectionBadge conversation={conversation} /></div>
      <p className={cn(
        'font-serif text-white leading-[1.5] mb-5 text-balance',
        conversation.type === 'statement' ? 'italic text-[22px]' : 'text-[22px]'
      )}>
        {conversation.type === 'statement' ? `"${conversation.body}"` : conversation.body}
      </p>
      {conversation.type === 'statement' && (
        <div className="mb-5"><StatementVote /></div>
      )}
      <div className="flex items-center gap-4 text-white/28 text-[11px] mb-5">
        <span className="flex items-center gap-1"><Mic2 size={10} />{formatCount(conversation.scrut_count)} scruts</span>
        <span className="flex items-center gap-1"><Globe size={10} />{conversation.country_count} countries</span>
        <span className={cn('ml-auto font-medium', topicColor[conversation.topic] ?? 'text-white/30')}>
          {conversation.topic}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-xs font-medium transition-all"
        >
          <Mic2 size={12} /> Hear what people said
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onPin(); }}
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          className={cn(
            'px-3 py-2.5 rounded-xl border text-xs font-medium transition-all',
            isPinned ? 'text-amber-300 border-amber-400/40 bg-amber-400/8' : 'text-white/30 border-white/10 hover:text-white/60 hover:border-white/20'
          )}
        >
          {isPinned ? '📌' : 'Pin'}
        </button>
      </div>
    </div>
  );
}

function ScrutView({
  conversation, scrut, streamIndex, autoPlayVoice, onAvatarClick,
}: {
  conversation: ConversationStarter;
  scrut: Scrut;
  streamIndex: number;
  autoPlayVoice: boolean;
  onAvatarClick: (s: Scrut) => void;
}) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-4 flex items-start gap-2">
        <div className="shrink-0 w-0.5 self-stretch bg-white/10 rounded-full" style={{ minHeight: 24 }} />
        <p className="text-white/35 text-[12px] font-serif leading-snug line-clamp-2 italic">
          {conversation.body}
        </p>
      </div>
      <ScrutCard
        scrut={scrut}
        showPosition={conversation.type === 'statement'}
        onAvatarClick={onAvatarClick}
        autoPlayVoice={autoPlayVoice}
        contextText={conversation.body}
      />
      <div className="mt-5 flex justify-center">
        <span className="text-white/20 text-[10px] tracking-widest">{streamIndex + 1} · · ·</span>
      </div>
    </div>
  );
}
