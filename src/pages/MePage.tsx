import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic2, MessageCircle, Camera, Loader2, Edit3, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import MakeScruttinYours from '@/components/features/MakeScruttinYours';
import MeTopBar from '@/components/features/MeTopBar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Tab = 'scruts' | 'yours' | 'account';

interface MyScrut {
  id: string;
  text?: string;
  type: string;
  created_at: string;
  resonate_count: number;
  conversation_id?: string;
  conversation?: { body: string; topic: string };
}

const INPUT_CLS = 'w-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.12)] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[rgba(255,255,255,0.25)] focus:outline-none focus:border-[rgba(255,255,255,0.28)] transition-colors';

export default function MePage() {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('scruts');
  const [myScruts, setMyScruts] = useState<MyScrut[]>([]);
  const [activity, setActivity] = useState({ scruts_given: 0, conversations_asked: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/auth', { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    setEditName(user.display_name ?? '');
    setEditBio(user.bio ?? '');
    setEditCity(user.city ?? '');
    setEditWebsite(user.website ?? '');
    setEditTwitter(user.twitter ?? '');
    setEditInstagram(user.instagram ?? '');
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setDataLoading(true);
      const [scrutsRes, convRes, myScrutsRes] = await Promise.all([
        supabase.from('scruts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase
          .from('scruts')
          .select('id, text, type, created_at, resonate_count, conversation_id, conversation:conversation_id(body, topic)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);
      setActivity({
        scruts_given: scrutsRes.count ?? 0,
        conversations_asked: convRes.count ?? 0,
      });
      setMyScruts((myScrutsRes.data ?? []) as MyScrut[]);
      setDataLoading(false);
    })();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from('user_profiles').update({
      display_name: editName.trim(),
      bio: editBio.trim() || null,
      city: editCity.trim() || null,
      website: editWebsite.trim() || null,
      twitter: editTwitter.trim().replace('@', '') || null,
      instagram: editInstagram.trim().replace('@', '') || null,
    }).eq('id', user.id);
    setSavingProfile(false);
    if (error) { toast.error(error.message); return; }
    await refreshUser();
    setEditing(false);
    toast.success('Profile updated');
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarUploading(true);
    const path = `${user.id}/avatar-${Date.now()}.${file.name.split('.').pop()}`;
    const { data, error } = await supabase.storage.from('profile-pics').upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); setAvatarUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('profile-pics').getPublicUrl(data.path);
    await supabase.from('user_profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
    await refreshUser();
    setAvatarUploading(false);
    toast.success('Photo updated');
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={24} className="text-white/30 animate-spin" />
      </div>
    );
  }

  const initials = user.display_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen pb-24 overflow-y-auto">
      {/* Top bar */}
      <div className="px-5 pt-safe pt-4 pb-0 flex items-center justify-between shrink-0">
        <h1 className="text-white font-bold text-xl tracking-tight">Me</h1>
        <MeTopBar />
      </div>

      {/* Profile hero */}
      <div className="px-5 pt-5 pb-0 shrink-0">
        <div className="relative rounded-3xl overflow-hidden p-5 mb-4"
          style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>

          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <label className="cursor-pointer">
                <div className="w-16 h-16 rounded-2xl overflow-hidden relative"
                  style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.5) 0%,rgba(59,130,246,0.5) 100%)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xl text-white">{initials}</div>
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 size={16} className="animate-spin text-white" />
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                  <Camera size={10} className="text-white/60" />
                </div>
              </label>
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              {editing ? (
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className={cn(INPUT_CLS, 'mb-1')}
                  placeholder="Display name"
                />
              ) : (
                <h2 className="text-white font-bold text-[18px] leading-tight">{user.display_name}</h2>
              )}
              <div className="flex items-center gap-1 mt-1">
                {editing ? (
                  <input
                    value={editCity}
                    onChange={e => setEditCity(e.target.value)}
                    placeholder={user.country ?? 'City'}
                    className={cn(INPUT_CLS, 'text-xs py-1.5')}
                  />
                ) : (
                  <span className="text-white/40 text-xs">
                    {user.city ? `${user.city}, ${user.country}` : (user.country ?? 'No location set')}
                  </span>
                )}
              </div>
            </div>

            {editing ? (
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setEditing(false)} className="p-1.5 text-white/30 hover:text-white/70 transition-colors"><X size={15} /></button>
                <button onClick={saveProfile} disabled={savingProfile} className="p-1.5 text-emerald-400 hover:text-emerald-300 transition-colors">
                  {savingProfile ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                </button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="shrink-0 p-1.5 text-white/25 hover:text-white/60 transition-colors">
                <Edit3 size={14} />
              </button>
            )}
          </div>

          {editing ? (
            <textarea
              value={editBio}
              onChange={e => setEditBio(e.target.value)}
              placeholder="A sentence about yourself…"
              rows={2}
              className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2.5 text-white/70 text-sm font-serif resize-none focus:outline-none focus:border-[rgba(255,255,255,0.25)] mb-4 placeholder-[rgba(255,255,255,0.25)]"
            />
          ) : (
            user.bio && <p className="text-white/55 text-[13px] font-serif leading-[1.65] mb-4">{user.bio}</p>
          )}

          {editing && (
            <div className="space-y-2 mb-4">
              <input value={editWebsite} onChange={e => setEditWebsite(e.target.value)} placeholder="Website" className={INPUT_CLS} />
              <div className="flex gap-2">
                <input value={editTwitter} onChange={e => setEditTwitter(e.target.value)} placeholder="Twitter / X" className={cn(INPUT_CLS, 'flex-1')} style={{ width: 'auto' }} />
                <input value={editInstagram} onChange={e => setEditInstagram(e.target.value)} placeholder="Instagram" className={cn(INPUT_CLS, 'flex-1')} style={{ width: 'auto' }} />
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Scruts given', value: activity.scruts_given, icon: Mic2, color: 'text-violet-400' },
              { label: 'Questions asked', value: activity.conversations_asked, icon: MessageCircle, color: 'text-sky-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Icon size={12} className={cn('mx-auto mb-1.5', color)} strokeWidth={1.8} />
                <p className="text-white font-bold text-[20px] leading-none">{value}</p>
                <p className="text-white/30 text-[10px] mt-1 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-4">
          {([
            { id: 'scruts', label: 'My Scruts' },
            { id: 'yours', label: '✦ Make It Yours' },
            { id: 'account', label: 'Account' },
          ] as { id: Tab; label: string }[]).map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                activeTab === t.id ? 'bg-white/15 text-white' : 'text-white/35 hover:text-white/60')}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 px-5 pb-4">
        {activeTab === 'scruts' && (
          dataLoading ? (
            <div className="flex justify-center py-12"><Loader2 size={18} className="text-white/20 animate-spin" /></div>
          ) : myScruts.length === 0 ? (
            <div className="text-center py-16 text-white/25">
              <Mic2 size={28} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium mb-1 text-white/40 text-sm">No scruts yet</p>
              <p className="text-xs">Join a conversation in the stream</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myScruts.map(s => (
                <button
                  key={s.id}
                  onClick={() => s.conversation_id && navigate(`/conversation/${s.conversation_id}`)}
                  className="w-full text-left p-4 rounded-2xl bg-white/4 border border-white/7 hover:bg-white/8 transition-all"
                >
                  {s.conversation && (
                    <p className="text-[10px] font-medium uppercase tracking-widest text-white/30 mb-1.5 truncate">
                      {(s.conversation as Record<string, unknown>).topic as string} · {((s.conversation as Record<string, unknown>).body as string)?.slice(0, 50)}…
                    </p>
                  )}
                  {s.type === 'text' && s.text ? (
                    <p className="text-white/75 font-serif text-[13px] leading-snug line-clamp-3">{s.text}</p>
                  ) : (
                    <p className="text-white/40 text-[13px] italic">Voice scrut</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white/20 text-[10px]">{new Date(s.created_at).toLocaleDateString()}</span>
                    {s.resonate_count > 0 && (
                      <span className="text-rose-400/70 text-[10px]">{s.resonate_count} resonates</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )
        )}

        {activeTab === 'yours' && <MakeScruttinYours />}

        {activeTab === 'account' && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="px-4 py-3 rounded-xl bg-white/4 border border-white/6">
                <p className="text-white/40 text-xs mb-0.5">Signed in as</p>
                <p className="text-white/70 text-sm">{user.email}</p>
              </div>
              {user.date_of_birth && (
                <div className="px-4 py-3 rounded-xl bg-white/4 border border-white/6">
                  <p className="text-white/40 text-xs mb-0.5">Date of birth</p>
                  <p className="text-white/60 text-sm">{new Date(user.date_of_birth).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
