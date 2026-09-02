import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { MOCK_USERS, MOCK_SCRUTS, MOCK_CONVERSATIONS, OPEN_SCRUTS } from '@/constants/mockData';
import type { User, Scrut } from '@/types';

const STORAGE_KEY_TAGGED = 'scruttin_tagged_user_ids';
const STORAGE_KEY_REPOSTS = 'scruttin_reposted_ids';
const STORAGE_KEY_BOOKMARKS = 'scruttin_bookmarked_ids';
const STORAGE_KEY_LOCAL_POSTS = 'scruttin_custom_feed_posts';

const DEFAULT_TAGGED_IDS = ['u1', 'u3', 'u4', 'u5', 'u8', 'u7'];

export interface TaggedFeedPost {
  id: string;
  user: User;
  text?: string;
  type: 'text' | 'voice';
  audio_url?: string;
  audio_duration?: number;
  created_at: string;
  resonate_count: number;
  resonated_by_me?: boolean;
  repost_count: number;
  reposted_by_me?: boolean;
  reply_count: number;
  bookmarked_by_me?: boolean;
  conversation_id?: string;
  context_question?: string;
  context_topic?: string;
  parent_id?: string;
}

interface TaggedContextType {
  taggedIds: string[];
  isTagged: (userId: string) => boolean;
  toggleTag: (user: User) => boolean;
  tagUser: (user: User) => void;
  untagUser: (userId: string) => void;
  repostedIds: string[];
  toggleRepost: (postId: string) => boolean;
  bookmarkedIds: string[];
  toggleBookmark: (postId: string) => boolean;
  localPosts: TaggedFeedPost[];
  addPost: (post: Omit<TaggedFeedPost, 'id' | 'created_at' | 'resonate_count' | 'repost_count' | 'reply_count'>) => TaggedFeedPost;
  getTaggedUsersList: () => User[];
  allKnownUsers: User[];
}

const TaggedContext = createContext<TaggedContextType | null>(null);

export function TaggedProvider({ children }: { children: ReactNode }) {
  const [taggedIds, setTaggedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TAGGED);
      return stored ? JSON.parse(stored) : DEFAULT_TAGGED_IDS;
    } catch {
      return DEFAULT_TAGGED_IDS;
    }
  });

  const [repostedIds, setRepostedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_REPOSTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [localPosts, setLocalPosts] = useState<TaggedFeedPost[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOCAL_POSTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TAGGED, JSON.stringify(taggedIds));
    } catch (e) {
      console.warn('Failed to persist tagged users', e);
    }
  }, [taggedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REPOSTS, JSON.stringify(repostedIds));
    } catch (e) {
      console.warn('Failed to persist reposted posts', e);
    }
  }, [repostedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.warn('Failed to persist bookmarks', e);
    }
  }, [bookmarkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOCAL_POSTS, JSON.stringify(localPosts));
    } catch (e) {
      console.warn('Failed to persist local posts', e);
    }
  }, [localPosts]);

  const isTagged = useCallback((userId: string) => taggedIds.includes(userId), [taggedIds]);

  const toggleTag = useCallback((user: User) => {
    let nowTagged = false;
    setTaggedIds((prev) => {
      if (prev.includes(user.id)) {
        nowTagged = false;
        toast.info(`Stopped tagging along with ${user.display_name}`);
        return prev.filter((id) => id !== user.id);
      } else {
        nowTagged = true;
        toast.success(`Tagging along with ${user.display_name}! Their posts now appear in your Tagged feed.`);
        return [...prev, user.id];
      }
    });
    return nowTagged;
  }, []);

  const tagUser = useCallback((user: User) => {
    setTaggedIds((prev) => {
      if (prev.includes(user.id)) return prev;
      toast.success(`Tagging along with ${user.display_name}!`);
      return [...prev, user.id];
    });
  }, []);

  const untagUser = useCallback((userId: string) => {
    setTaggedIds((prev) => prev.filter((id) => id !== userId));
  }, []);

  const toggleRepost = useCallback((postId: string) => {
    let nowReposted = false;
    setRepostedIds((prev) => {
      if (prev.includes(postId)) {
        nowReposted = false;
        toast.info('Removed Re-Scrut');
        return prev.filter((id) => id !== postId);
      } else {
        nowReposted = true;
        toast.success('Re-Scrutted to your feed!');
        return [...prev, postId];
      }
    });
    return nowReposted;
  }, []);

  const toggleBookmark = useCallback((postId: string) => {
    let nowBookmarked = false;
    setBookmarkedIds((prev) => {
      if (prev.includes(postId)) {
        nowBookmarked = false;
        toast.info('Removed from bookmarks');
        return prev.filter((id) => id !== postId);
      } else {
        nowBookmarked = true;
        toast.success('Saved to your bookmarks');
        return [...prev, postId];
      }
    });
    return nowBookmarked;
  }, []);

  const addPost = useCallback((postData: Omit<TaggedFeedPost, 'id' | 'created_at' | 'resonate_count' | 'repost_count' | 'reply_count'>) => {
    const newPost: TaggedFeedPost = {
      ...postData,
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      created_at: new Date().toISOString(),
      resonate_count: 0,
      repost_count: 0,
      reply_count: 0,
    };
    setLocalPosts((prev) => [newPost, ...prev]);
    toast.success('Your thought has been shared to Tagged!');
    return newPost;
  }, []);

  const getTaggedUsersList = useCallback(() => {
    return MOCK_USERS.filter((u) => taggedIds.includes(u.id));
  }, [taggedIds]);

  return (
    <TaggedContext.Provider
      value={{
        taggedIds,
        isTagged,
        toggleTag,
        tagUser,
        untagUser,
        repostedIds,
        toggleRepost,
        bookmarkedIds,
        toggleBookmark,
        localPosts,
        addPost,
        getTaggedUsersList,
        allKnownUsers: MOCK_USERS,
      }}
    >
      {children}
    </TaggedContext.Provider>
  );
}

export function useTagged() {
  const context = useContext(TaggedContext);
  if (!context) {
    throw new Error('useTagged must be used within a TaggedProvider');
  }
  return context;
}
