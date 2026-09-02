import { useState, useMemo, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Repeat2,
  Heart,
  Bookmark,
  Share2,
  Search,
  Sparkles,
  Mic,
  MicOff,
  Send,
  UserPlus,
  UserCheck,
  RefreshCw,
  SlidersHorizontal,
  Globe,
  Play,
  Pause,
  Volume2,
  X,
  ExternalLink,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTagged, TaggedFeedPost } from '@/stores/taggedContext';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_CONVERSATIONS, MOCK_SCRUTS, OPEN_SCRUTS, MOCK_USERS } from '@/constants/mockData';
import type { User, Scrut, ConversationStarter } from '@/types';
import UserAvatar from '@/components/features/UserAvatar';
import ScrutDetailSheet from '@/components/features/ScrutDetailSheet';
import ShareModal from '@/components/features/ShareModal';
import AtmosphereControls from '@/components/layout/AtmosphereControls';
import { cn, timeAgo, formatCount } from '@/lib/utils';
import { toast } from 'sonner';

type FeedTab = 'for_you' | 'tagged_along' | 'voice' | 'bookmarks';

const TOPICS = ['All', 'Life', 'Culture', 'Relationships', 'Philosophy', 'Work', 'Society'];

export default function TaggedPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const {
    taggedIds,
    isTagged,
    toggleTag,
    repostedIds,
    toggleRepost,
    bookmarkedIds,
    toggleBookmark,
    localPosts,
    addPost,
    allKnownUsers,
  } = useTagged();

  const [activeTab, setActiveTab] = useState<FeedTab>('for_you');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [sharingPost, setSharingPost] = useState<{ post: TaggedFeedPost; conversation?: ConversationStarter } | null>(null);
  const [replyingToPost, setReplyingToPost] = useState<TaggedFeedPost | null>(null);

  // Quick Composer State
  const [composerText, setComposerText] = useState('');
  const [composerTopic, setComposerTopic] = useState('Life');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio player state for voice notes in feed
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Build the unified initial seed feed
  const rawPosts = useMemo(() => {
    const posts: TaggedFeedPost[] = [];

    // Add local user posts first
    localPosts.forEach((post) => {
      posts.push(post);
    });

    // Extract scruts from mock conversations
    MOCK_CONVERSATIONS.forEach((conv) => {
      const scruts = MOCK_SCRUTS[conv.id] ?? [];
      scruts.forEach((s) => {
        posts.push({
          id: s.id,
          user: s.user,
          text: s.text,
          type: s.type,
          audio_url: s.audio_url,
          audio_duration: s.audio_duration,
          created_at: s.created_at,
          resonate_count: s.resonate_count ?? 12,
          resonated_by_me: s.resonated_by_me,
          repost_count: Math.floor((s.resonate_count ?? 10) / 3),
          reply_count: Math.floor((s.resonate_count ?? 10) / 4) + 1,
          conversation_id: conv.id,
          context_question: conv.body,
          context_topic: conv.topic,
        });
      });
    });

    // Extract open scruts
    OPEN_SCRUTS.forEach((s) => {
      posts.push({
        id: s.id,
        user: s.user,
        text: s.text,
        type: s.type,
        audio_url: s.audio_url,
        audio_duration: s.audio_duration,
        created_at: s.created_at,
        resonate_count: s.resonate_count ?? 8,
        resonated_by_me: s.resonated_by_me,
        repost_count: Math.floor((s.resonate_count ?? 8) / 4),
        reply_count: 2,
        context_topic: 'Open Mic',
      });
    });

    return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [localPosts]);

  // Filter posts based on activeTab, topic, search query
  const filteredPosts = useMemo(() => {
    return rawPosts.filter((post) => {
      // Tab filter
      if (activeTab === 'tagged_along' && !taggedIds.includes(post.user.id) && post.user.id !== currentUser?.id) {
        return false;
      }
      if (activeTab === 'voice' && post.type !== 'voice') {
        return false;
      }
      if (activeTab === 'bookmarks' && !bookmarkedIds.includes(post.id)) {
        return false;
      }

      // Topic filter
      if (selectedTopic !== 'All') {
        const matchesTopic = post.context_topic?.toLowerCase() === selectedTopic.toLowerCase() ||
          post.text?.toLowerCase().includes(`#${selectedTopic.toLowerCase()}`);
        if (!matchesTopic) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          post.text?.toLowerCase().includes(q) ||
          post.user.display_name.toLowerCase().includes(q) ||
          post.user.country?.toLowerCase().includes(q) ||
          post.context_question?.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [rawPosts, activeTab, taggedIds, currentUser?.id, bookmarkedIds, selectedTopic, searchQuery]);

  // Pull to refresh simulation
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Tagged feed refreshed');
    }, 500);
  };

  // Voice recording simulation
  const toggleRecording = () => {
    if (isVoiceRecording) {
      // Stop recording
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setIsVoiceRecording(false);
    } else {
      // Start recording
      setIsVoiceRecording(true);
      setVoiceDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setVoiceDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  // Post new thought
  const handlePublishPost = () => {
    if (!composerText.trim() && !isVoiceRecording && voiceDuration === 0) {
      toast.error("Please write a thought or record a voice note.");
      return;
    }

    const postUser: User = currentUser
      ? {
          id: currentUser.id,
          display_name: currentUser.display_name || 'You',
          avatar_url: currentUser.avatar_url || '',
          country: currentUser.country || 'Global',
          city: currentUser.city || '',
          bio: currentUser.bio || '',
        }
      : {
          id: 'me-anon',
          display_name: 'You',
          avatar_url: '',
          country: 'Global',
        };

    const hasVoice = voiceDuration > 0 || isVoiceRecording;
    if (isVoiceRecording) {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setIsVoiceRecording(false);
    }

    addPost({
      user: postUser,
      text: composerText.trim(),
      type: hasVoice ? 'voice' : 'text',
      audio_duration: hasVoice ? Math.max(voiceDuration, 14) : undefined,
      audio_url: hasVoice ? '/ambient/silence.mp3' : undefined,
      context_topic: composerTopic,
    });

    setComposerText('');
    setVoiceDuration(0);
  };

  // Handle Play/Pause of voice clips
  const handleToggleAudio = (postId: string, duration = 30) => {
    if (activeAudioId === postId && isPlaying) {
      setIsPlaying(false);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    } else {
      setActiveAudioId(postId);
      setIsPlaying(true);
      setAudioProgress(0);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);

      audioIntervalRef.current = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
            setIsPlaying(false);
            return 0;
          }
          return prev + (100 / (duration * 10));
        });
      }, 100);
    }
  };

  // Suggested accounts to tag along with (who are not yet tagged)
  const suggestedUsers = useMemo(() => {
    return allKnownUsers.filter((u) => !taggedIds.includes(u.id)).slice(0, 8);
  }, [allKnownUsers, taggedIds]);

  return (
    <div className="flex flex-col min-h-screen bg-scruttin-base pb-24 text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0c0c14]/90 backdrop-blur-xl px-4 pt-safe pt-3 pb-2.5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-white/10 to-white/20 border border-white/15 shadow-inner">
              <span className="font-serif font-bold text-lg text-white">#</span>
            </div>
            <div>
              <h1 className="text-[17px] font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
                Tagged
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  LIVE
                </span>
              </h1>
              <p className="text-[11px] text-white/40 font-medium mt-0.5">
                Micro-perspectives &amp; tagged creator stream
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="refresh-tagged-feed"
              onClick={handleRefresh}
              title="Refresh Feed"
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-all active:scale-95"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin text-white' : ''} />
            </button>
            <AtmosphereControls />
          </div>
        </div>

        {/* Tab switcher: For You / Tagged Along / Voice / Bookmarks */}
        <div className="max-w-xl mx-auto mt-2.5 flex items-center justify-between border-t border-white/5 pt-1.5">
          <div className="flex items-center gap-1 flex-1">
            <button
              type="button"
              onClick={() => setActiveTab('for_you')}
              className={cn(
                'relative px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all',
                activeTab === 'for_you'
                  ? 'text-white bg-white/10 shadow-sm'
                  : 'text-white/45 hover:text-white/75 hover:bg-white/5'
              )}
            >
              For You
              {activeTab === 'for_you' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full" />
              )}
            </button>

            <button
              type="button"
              id="tab-tagged-along"
              onClick={() => setActiveTab('tagged_along')}
              className={cn(
                'relative px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5',
                activeTab === 'tagged_along'
                  ? 'text-white bg-white/10 shadow-sm'
                  : 'text-white/45 hover:text-white/75 hover:bg-white/5'
              )}
            >
              <span>Tagged Along</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/70">
                {taggedIds.length}
              </span>
              {activeTab === 'tagged_along' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('voice')}
              className={cn(
                'relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1',
                activeTab === 'voice'
                  ? 'text-white bg-white/10 shadow-sm'
                  : 'text-white/45 hover:text-white/75 hover:bg-white/5'
              )}
            >
              <Headphones size={12} />
              <span>Voice</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bookmarks')}
              className={cn(
                'relative px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ml-auto',
                activeTab === 'bookmarks'
                  ? 'text-white bg-white/10 shadow-sm'
                  : 'text-white/35 hover:text-white/75 hover:bg-white/5'
              )}
              title="Bookmarks"
            >
              <Bookmark size={13} fill={activeTab === 'bookmarks' ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto w-full px-3 pt-3 flex-1">
        {/* Search & Topic Chips */}
        <div className="mb-3.5 space-y-2">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3.5 text-white/30 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search thoughts, authors, or questions..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.05] border border-white/8 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.08] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 text-white/40 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Horizontal Topic Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={cn(
                  'shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition-all font-medium',
                  selectedTopic === topic
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-white/[0.03] text-white/50 border-white/8 hover:text-white/80 hover:bg-white/[0.07]'
                )}
              >
                {topic === 'All' ? '✦ All Topics' : `#${topic}`}
              </button>
            ))}
          </div>
        </div>

        {/* Suggested People to Tag Along (Story-like discovery bar) */}
        {suggestedUsers.length > 0 && activeTab === 'for_you' && (
          <section className="mb-4 rounded-2xl bg-white/[0.03] border border-white/8 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-white/45 flex items-center gap-1.5">
                <Sparkles size={11} className="text-amber-400" />
                Discover Voices to Tag Along
              </span>
              <span className="text-[10px] text-white/30">Tap to follow</span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              {suggestedUsers.map((u) => {
                const isUserTagged = isTagged(u.id);
                return (
                  <div
                    key={u.id}
                    className="shrink-0 flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all w-24 text-center group cursor-pointer"
                    onClick={() => setProfileUser(u)}
                  >
                    <div className="relative">
                      <UserAvatar user={u} size="md" shape="circle" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTag(u);
                        }}
                        className={cn(
                          'absolute -bottom-1 -right-1 p-1 rounded-full border shadow-sm transition-all',
                          isUserTagged
                            ? 'bg-emerald-500 text-white border-white/20'
                            : 'bg-white text-black border-black/10 hover:scale-110'
                        )}
                        title={isUserTagged ? 'Tagged' : 'Tag along'}
                      >
                        {isUserTagged ? <UserCheck size={9} /> : <UserPlus size={9} />}
                      </button>
                    </div>

                    <span className="text-[11px] font-medium text-white/90 truncate w-full group-hover:text-white">
                      {u.display_name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-white/40 truncate w-full">
                      {u.country || 'Global'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick Microblog Composer (X / Bluesky Style) */}
        <section className="mb-4 rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 shadow-md">
          <div className="flex items-start gap-3">
            <UserAvatar
              user={
                currentUser
                  ? {
                      id: currentUser.id,
                      display_name: currentUser.display_name || 'You',
                      avatar_url: currentUser.avatar_url || '',
                      country: currentUser.country || '',
                    }
                  : { id: 'me', display_name: 'You' }
              }
              size="md"
              shape="circle"
            />

            <div className="flex-1 min-w-0">
              <textarea
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                placeholder="What's your perspective? Share a thought or scrut..."
                rows={2}
                maxLength={280}
                className="w-full bg-transparent border-0 text-[14px] text-white placeholder-white/35 focus:outline-none resize-none leading-relaxed"
              />

              {/* Voice recording preview pill */}
              {(isVoiceRecording || voiceDuration > 0) && (
                <div className="flex items-center gap-2 mb-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  <span className={cn('w-2 h-2 rounded-full bg-rose-500', isVoiceRecording && 'animate-ping')} />
                  <span>
                    {isVoiceRecording ? 'Recording voice thought...' : 'Voice clip attached:'}{' '}
                    <strong>{voiceDuration}s</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
                      setIsVoiceRecording(false);
                      setVoiceDuration(0);
                    }}
                    className="ml-auto text-rose-400 hover:text-rose-200 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Composer Toolbar */}
              <div className="flex items-center justify-between border-t border-white/8 pt-2.5 mt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={cn(
                      'p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5',
                      isVoiceRecording
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : voiceDuration > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-white/5 text-white/60 border-white/8 hover:text-white hover:bg-white/10'
                    )}
                    title="Record voice note"
                  >
                    {isVoiceRecording ? <MicOff size={13} /> : <Mic size={13} />}
                    <span className="text-[11px]">{isVoiceRecording ? 'Stop' : 'Voice'}</span>
                  </button>

                  <select
                    value={composerTopic}
                    onChange={(e) => setComposerTopic(e.target.value)}
                    className="text-[11px] bg-white/5 text-white/60 border border-white/8 rounded-xl px-2 py-1.5 focus:outline-none focus:border-white/20"
                  >
                    <option value="Life" className="bg-[#12121c] text-white">#Life</option>
                    <option value="Culture" className="bg-[#12121c] text-white">#Culture</option>
                    <option value="Relationships" className="bg-[#12121c] text-white">#Relationships</option>
                    <option value="Philosophy" className="bg-[#12121c] text-white">#Philosophy</option>
                    <option value="Work" className="bg-[#12121c] text-white">#Work</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn('text-[10px] font-mono', composerText.length > 250 ? 'text-amber-400' : 'text-white/30')}>
                    {280 - composerText.length}
                  </span>
                  <button
                    type="button"
                    id="publish-tagged-post"
                    onClick={handlePublishPost}
                    disabled={!composerText.trim() && voiceDuration === 0 && !isVoiceRecording}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm active:scale-95"
                  >
                    <span>Post</span>
                    <Send size={11} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feed Posts List (Twitter / Bluesky style) */}
        {filteredPosts.length > 0 ? (
          <div className="space-y-3">
            {filteredPosts.map((post) => {
              const userIsTagged = isTagged(post.user.id);
              const isReposted = repostedIds.includes(post.id);
              const isBookmarked = bookmarkedIds.includes(post.id);
              const isAudioActive = activeAudioId === post.id && isPlaying;

              return (
                <article
                  key={post.id}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 transition-all duration-200 hover:bg-white/[0.05] hover:border-white/15 relative overflow-hidden"
                >
                  {/* Top Repost context if reposted */}
                  {isReposted && (
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400/90 mb-2 pl-2">
                      <Repeat2 size={11} />
                      <span>You re-scrutted this</span>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    {/* Left Column: Avatar */}
                    <div
                      className="shrink-0 cursor-pointer group/avatar relative"
                      onClick={() => setProfileUser(post.user)}
                    >
                      <UserAvatar user={post.user} size="md" shape="circle" />
                    </div>

                    {/* Right Column: Author Info, Content, Embeds, Actions */}
                    <div className="flex-1 min-w-0">
                      {/* Author Header Bar */}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setProfileUser(post.user)}
                            className="font-semibold text-white text-[14px] leading-tight hover:underline truncate"
                          >
                            {post.user.display_name}
                          </button>
                          <span className="text-[12px] text-white/40 font-normal truncate">
                            @{post.user.twitter || post.user.display_name.toLowerCase().replace(/\s+/g, '')}
                          </span>
                          <span className="text-white/20 text-xs">·</span>
                          <span className="text-[12px] text-white/40">
                            {timeAgo(post.created_at)}
                          </span>
                          {post.user.country && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-white/35 px-1.5 py-0.2 rounded bg-white/5 border border-white/5">
                              <Globe size={9} />
                              {post.user.country}
                            </span>
                          )}
                        </div>

                        {/* Tag Along Quick Toggle */}
                        {post.user.id !== 'platform' && post.user.id !== currentUser?.id && (
                          <button
                            type="button"
                            onClick={() => toggleTag(post.user)}
                            className={cn(
                              'text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all shrink-0',
                              userIsTagged
                                ? 'border-white/10 text-white/40 bg-white/5 hover:text-rose-300 hover:border-rose-500/30'
                                : 'border-white/20 text-white bg-white/10 hover:bg-white hover:text-black'
                            )}
                          >
                            {userIsTagged ? 'Tagged' : '+ Tag Along'}
                          </button>
                        )}
                      </div>

                      {/* Quoted Prompt / Question Context if present */}
                      {post.context_question && (
                        <div
                          onClick={() => {
                            if (post.conversation_id) {
                              navigate(`/questions/${post.conversation_id}`);
                            }
                          }}
                          className="my-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/8 hover:bg-white/[0.06] transition-all cursor-pointer group/context"
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/40 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>In response to:</span>
                            {post.context_topic && (
                              <span className="text-amber-400/80 ml-auto font-semibold">
                                #{post.context_topic}
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] font-serif text-white/75 group-hover/context:text-white leading-snug">
                            “{post.context_question}”
                          </p>
                        </div>
                      )}

                      {/* Post Text Body */}
                      {post.text && (
                        <p className="text-[14.5px] leading-relaxed text-white/90 whitespace-pre-line font-sans mb-3 select-text">
                          {post.text}
                        </p>
                      )}

                      {/* Voice Note Waveform Player */}
                      {post.type === 'voice' && (
                        <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-white/[0.05] to-white/[0.02] border border-white/10 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleAudio(post.id, post.audio_duration ?? 28)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-md"
                          >
                            {isAudioActive ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-[11px] text-white/50 mb-1">
                              <span className="flex items-center gap-1">
                                <Volume2 size={11} className={isAudioActive ? 'text-emerald-400 animate-pulse' : ''} />
                                Voice Scrut
                              </span>
                              <span>{post.audio_duration ?? 28}s</span>
                            </div>

                            {/* Simulated waveform bars */}
                            <div className="h-4 flex items-center gap-0.5 overflow-hidden">
                              {Array.from({ length: 28 }).map((_, i) => {
                                const h = ((Math.sin(i * 0.8) + 1.2) * 50) + (i % 3 === 0 ? 25 : 5);
                                const played = isAudioActive && (i / 28) * 100 <= audioProgress;
                                return (
                                  <div
                                    key={i}
                                    className={cn(
                                      'flex-1 rounded-full transition-all duration-150',
                                      played ? 'bg-white' : 'bg-white/20'
                                    )}
                                    style={{ height: `${Math.min(h, 100)}%` }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Twitter / Bluesky Style Interaction Bar */}
                      <div className="flex items-center justify-between pt-1 text-white/40 text-xs">
                        {/* Reply */}
                        <button
                          type="button"
                          onClick={() => setReplyingToPost(post)}
                          className="flex items-center gap-1.5 hover:text-sky-400 transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-sky-400/10 group/btn"
                        >
                          <MessageSquare size={14} className="group-hover/btn:scale-110 transition-transform" />
                          <span className="text-[11px] font-medium">{post.reply_count}</span>
                        </button>

                        {/* Repost / Re-Scrut */}
                        <button
                          type="button"
                          onClick={() => toggleRepost(post.id)}
                          className={cn(
                            'flex items-center gap-1.5 transition-colors p-1.5 rounded-lg group/btn',
                            isReposted
                              ? 'text-emerald-400 bg-emerald-400/10 font-semibold'
                              : 'hover:text-emerald-400 hover:bg-emerald-400/10'
                          )}
                        >
                          <Repeat2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                          <span className="text-[11px] font-medium">
                            {post.repost_count + (isReposted ? 1 : 0)}
                          </span>
                        </button>

                        {/* Like / Resonance */}
                        <button
                          type="button"
                          onClick={() => {
                            toast.success('Resonated with this thought');
                          }}
                          className="flex items-center gap-1.5 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-400/10 group/btn"
                        >
                          <Heart size={14} className="group-hover/btn:scale-110 transition-transform" />
                          <span className="text-[11px] font-medium">{formatCount(post.resonate_count)}</span>
                        </button>

                        {/* Bookmark */}
                        <button
                          type="button"
                          onClick={() => toggleBookmark(post.id)}
                          className={cn(
                            'flex items-center gap-1 hover:text-amber-400 transition-colors p-1.5 rounded-lg',
                            isBookmarked ? 'text-amber-400 bg-amber-400/10' : 'hover:bg-amber-400/10'
                          )}
                          title={isBookmarked ? 'Bookmarked' : 'Save bookmark'}
                        >
                          <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
                        </button>

                        {/* Share */}
                        <button
                          type="button"
                          onClick={() => {
                            const foundConv = MOCK_CONVERSATIONS.find((c) => c.id === post.conversation_id);
                            setSharingPost({ post, conversation: foundConv });
                          }}
                          className="flex items-center gap-1 hover:text-white transition-colors p-1.5 -mr-1.5 rounded-lg hover:bg-white/10"
                          title="Share post"
                        >
                          <Share2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="my-12 rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40 mb-4">
              <Headphones size={24} />
            </div>
            <h3 className="text-base font-semibold text-white/90">
              {activeTab === 'tagged_along' ? 'No posts from tagged creators yet' : 'No matching thoughts found'}
            </h3>
            <p className="mt-1.5 text-xs text-white/45 max-w-sm leading-relaxed">
              {activeTab === 'tagged_along'
                ? 'Tag along with people across the stream or from their profile sheet to see their thoughts here.'
                : 'Try adjusting your search query or exploring other topic filters.'}
            </p>

            {activeTab === 'tagged_along' && (
              <button
                type="button"
                onClick={() => setActiveTab('for_you')}
                className="mt-4 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all shadow-sm"
              >
                Explore For You Feed
              </button>
            )}
          </div>
        )}
      </main>

      {/* User Profile Sheet (Tag Along action integrated) */}
      {profileUser && (
        <ScrutDetailSheet
          user={profileUser}
          onClose={() => setProfileUser(null)}
        />
      )}

      {/* Share Social Card Modal */}
      {sharingPost && (
        <ShareModal
          conversation={
            sharingPost.conversation || {
              id: sharingPost.post.id,
              user_id: sharingPost.post.user.id,
              user: sharingPost.post.user,
              type: 'statement',
              body: sharingPost.post.text || 'Insight shared on Scruttin',
              topic: sharingPost.post.context_topic || 'Tagged',
              created_at: sharingPost.post.created_at,
              scrut_count: 14,
              country_count: 6,
              is_platform: false,
              circulation_score: 0.85,
            }
          }
          scrut={{
            id: sharingPost.post.id,
            conversation_id: sharingPost.post.conversation_id || 'tagged',
            user_id: sharingPost.post.user.id,
            user: sharingPost.post.user,
            text: sharingPost.post.text,
            type: sharingPost.post.type,
            audio_url: sharingPost.post.audio_url,
            audio_duration: sharingPost.post.audio_duration,
            created_at: sharingPost.post.created_at,
            resonate_count: sharingPost.post.resonate_count,
            resonated_by_me: sharingPost.post.resonated_by_me,
          }}
          onClose={() => setSharingPost(null)}
        />
      )}

      {/* Reply Modal */}
      {replyingToPost && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm animate-fade-in"
          onClick={() => setReplyingToPost(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#14141e] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/8 mb-3">
              <span className="text-xs font-semibold text-white/70">
                Replying to <span className="text-white">@{replyingToPost.user.display_name}</span>
              </span>
              <button
                type="button"
                onClick={() => setReplyingToPost(null)}
                className="p-1 rounded-full text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-white/50 italic mb-3 line-clamp-2">
              “{replyingToPost.text || 'Voice perspective'}”
            </p>

            <textarea
              placeholder="Post your reply..."
              rows={3}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/25 resize-none mb-3"
              autoFocus
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReplyingToPost(null)}
                className="px-3.5 py-1.5 text-xs text-white/50 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success('Reply posted to thread');
                  setReplyingToPost(null);
                }}
                className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
