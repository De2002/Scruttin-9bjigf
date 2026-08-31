import { useMemo, useState } from 'react';
import { Bookmark, Headphones, Mic2, MoreHorizontal, RefreshCw, X } from 'lucide-react';
import { OPEN_SCRUTS, MOCK_CONVERSATIONS, MOCK_SCRUTS } from '@/constants/mockData';
import type { Scrut, User } from '@/types';
import UserAvatar from '@/components/features/UserAvatar';
import VoiceScrutCard from '@/components/features/VoiceScrutCard';
import ResonatesButton from '@/components/features/ResonatesButton';
import AtmosphereControls from '@/components/layout/AtmosphereControls';
import { cn, timeAgo } from '@/lib/utils';

const taggedIds = ['u1', 'u3', 'u4', 'u5', 'u8'];
type FeedItem = { scrut: Scrut; prompt?: string; kind: 'asked' | 'scrutted' };

function buildFeed(): FeedItem[] {
  const items: FeedItem[] = [];
  MOCK_CONVERSATIONS.forEach((conversation) => {
    (MOCK_SCRUTS[conversation.id] ?? []).forEach((scrut) => {
      if (taggedIds.includes(scrut.user.id)) items.push({ scrut, prompt: conversation.body, kind: 'asked' });
    });
  });
  OPEN_SCRUTS.filter((scrut) => taggedIds.includes(scrut.user.id)).forEach((scrut) => items.push({ scrut, kind: 'scrutted' }));
  return items.sort((a, b) => new Date(b.scrut.created_at).getTime() - new Date(a.scrut.created_at).getTime());
}

function ProfileSheet({ user, tagged, onToggle, onClose }: { user: User; tagged: boolean; onToggle: () => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm" onClick={onClose}>
    <section className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#171722] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${user.display_name} profile`}>
      <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/20" />
      <div className="flex items-start justify-between"><div className="flex items-center gap-3"><UserAvatar user={user} size="lg" shape="circle" /><div><h2 className="text-lg font-semibold text-white">{user.display_name}</h2><p className="text-sm text-white/40">{[user.city, user.country].filter(Boolean).join(', ')}</p></div></div><button type="button" onClick={onClose} className="rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white" aria-label="Close profile"><X size={18} /></button></div>
      {user.bio && <p className="mt-5 text-sm leading-6 text-white/65">{user.bio}</p>}
      <button type="button" onClick={onToggle} className={cn('mt-6 w-full rounded-xl py-3 text-sm font-semibold transition-colors', tagged ? 'border border-white/15 bg-white/10 text-white' : 'bg-white text-black hover:bg-white/90')}>{tagged ? 'Tagged' : 'Tag Along'}</button>
    </section>
  </div>;
}

function Identity({ scrut, kind, onProfile }: { scrut: Scrut; kind: FeedItem['kind']; onProfile: (user: User) => void }) {
  return <div className="flex items-center gap-2 text-[13px] text-white/45"><button type="button" onClick={() => onProfile(scrut.user)} className="flex items-center gap-2 font-medium text-white/85 hover:text-white"><UserAvatar user={scrut.user} size="sm" shape="circle" /><span>{scrut.user.display_name}</span></button><span>·</span><span>{scrut.user.country}</span>{kind === 'asked' && <><span>·</span><span>asked</span></>}<span>·</span><span>{timeAgo(scrut.created_at)}</span></div>;
}

function FeedEntry({ item, onProfile }: { item: FeedItem; onProfile: (user: User) => void }) {
  const { scrut } = item;
  return <article className="border-b border-white/[0.07] px-5 py-6 last:border-0"><Identity scrut={scrut} kind={item.kind} onProfile={onProfile} />
    {item.prompt && <p className="mt-4 text-[15px] leading-6 text-white/55">“{item.prompt}”</p>}
    {scrut.type === 'text' ? <p className="mt-4 whitespace-pre-line text-[16px] leading-7 text-white/85">{scrut.text}</p> : <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4"><div className="mb-3 flex items-center gap-3 text-sm text-white/60"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70"><Mic2 size={15} /></span><span>Voice Scrut</span><span className="text-white/35">{scrut.audio_duration ?? 30}s</span></div><VoiceScrutCard duration={scrut.audio_duration ?? 30} user={scrut.user} scrutId={scrut.id} audioUrl={scrut.audio_url} autoPlay={false} showUser={false} /><>{scrut.text && <p className="mt-3 text-[15px] leading-6 text-white/65">{scrut.text}</p>}</></div>}
    <div className="mt-4 flex items-center gap-5"><ResonatesButton scrutId={scrut.id} initialCount={scrut.resonate_count ?? 0} initialResonated={scrut.resonated_by_me ?? false} size="sm" /><button type="button" className="text-white/35 hover:text-white" aria-label="Save this Scrut"><Bookmark size={16} /></button><button type="button" className="ml-auto text-white/35 hover:text-white" aria-label="More options"><MoreHorizontal size={18} /></button></div>
  </article>;
}

export default function TaggedPage() {
  const [refreshing, setRefreshing] = useState(false); const [refreshKey, setRefreshKey] = useState(0); const [selectedUser, setSelectedUser] = useState<User | null>(null); const [tagged, setTagged] = useState<Record<string, boolean>>(() => Object.fromEntries(taggedIds.map((id) => [id, true])));
  const feed = useMemo(buildFeed, [refreshKey]); const visibleFeed = feed.filter((item) => tagged[item.scrut.user.id]);
  const refresh = () => { setRefreshing(true); window.setTimeout(() => { setRefreshKey((key) => key + 1); setRefreshing(false); }, 450); };
  const toggleTag = () => { if (selectedUser) setTagged((state) => ({ ...state, [selectedUser.id]: !state[selectedUser.id] })); };
  return <main className="fixed inset-0 flex flex-col overflow-hidden bg-scruttin-base pb-16"><header className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-5 pb-4 pt-safe pt-4"><div><h1 className="text-xl font-semibold tracking-tight text-white">Tagged</h1><p className="mt-1 text-sm text-white/40">People you&apos;re tagging along with</p></div><div className="flex items-center gap-1"><button type="button" onClick={refresh} className="rounded-xl p-2.5 text-white/45 hover:bg-white/8 hover:text-white" aria-label="Refresh Tagged feed"><RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} /></button><AtmosphereControls /></div></header><div className="flex-1 overflow-y-auto overscroll-contain"><div className="mx-auto max-w-lg">{visibleFeed.length ? visibleFeed.map((item) => <FeedEntry key={`${refreshKey}-${item.scrut.id}`} item={item} onProfile={setSelectedUser} />) : <div className="flex flex-col items-center px-8 py-24 text-center"><Headphones size={28} className="mb-4 text-white/25" /><h2 className="text-base font-medium text-white/70">Your Tagged feed is quiet</h2><p className="mt-2 text-sm leading-6 text-white/35">Tag Along with people from their profile sheet to hear what they&apos;re saying here.</p></div>}</div></div>{selectedUser && <ProfileSheet user={selectedUser} tagged={Boolean(tagged[selectedUser.id])} onToggle={toggleTag} onClose={() => setSelectedUser(null)} />}</main>;
}
