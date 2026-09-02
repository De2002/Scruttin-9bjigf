import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { MOCK_USERS } from '@/constants/mockData';
import {
  INITIAL_TAGGED_POSTS,
  TaggedPostItem,
  TaggedSticker,
  TaggedReply,
  TaggedPoll,
  STICKER_PACK,
  CURATED_GIFS,
  PHOTO_PRESETS,
} from '@/constants/taggedData';
import type { User } from '@/types';

const STORAGE_KEY_TAGGED = 'scruttin_tagged_user_ids';
const STORAGE_KEY_LIKES = 'scruttin_tagged_liked_ids';
const STORAGE_KEY_REPOSTS = 'scruttin_tagged_reposted_ids';
const STORAGE_KEY_BOOKMARKS = 'scruttin_tagged_bookmarked_ids';
const STORAGE_KEY_LOCAL_POSTS = 'scruttin_tagged_custom_posts';
const STORAGE_KEY_POLL_VOTES = 'scruttin_tagged_poll_votes';

const DEFAULT_TAGGED_IDS = ['u5', 'u1', 'u4', 'u2'];

export interface NewTaggedPostPayload {
  user: User;
  text: string;
  image_url?: string;
  gif_url?: string;
  sticker?: TaggedSticker;
  poll?: TaggedPoll;
  location_tag?: string;
  mood_tag?: string;
}

interface TaggedContextType {
  taggedIds: string[];
  isTagged: (userId: string) => boolean;
  toggleTag: (user: User) => boolean;
  tagUser: (user: User) => void;
  untagUser: (userId: string) => void;
  
  likedIds: string[];
  toggleLike: (postId: string) => boolean;
  
  repostedIds: string[];
  toggleRepost: (postId: string) => boolean;
  
  bookmarkedIds: string[];
  toggleBookmark: (postId: string) => boolean;

  pollVotes: Record<string, string>;
  votePoll: (postId: string, optionId: string) => void;
  getUserPollVote: (postId: string) => string | undefined;
  
  posts: TaggedPostItem[];
  addPost: (payload: NewTaggedPostPayload) => TaggedPostItem;
  addReply: (postId: string, user: User, text: string, sticker?: TaggedSticker) => void;
  
  getTaggedUsersList: () => User[];
  allKnownUsers: User[];
  stickerPack: TaggedSticker[];
  curatedGifs: typeof CURATED_GIFS;
  photoPresets: typeof PHOTO_PRESETS;
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

  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LIKES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
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

  const [pollVotes, setPollVotes] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_POLL_VOTES);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [posts, setPosts] = useState<TaggedPostItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOCAL_POSTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure seed poll posts are available if user hasn't seen them
          const hasPollPost = parsed.some((p: TaggedPostItem) => p.poll);
          if (!hasPollPost) {
            const seedPolls = INITIAL_TAGGED_POSTS.filter((p) => p.poll);
            return [...seedPolls, ...parsed];
          }
          return parsed;
        }
      }
      return INITIAL_TAGGED_POSTS;
    } catch {
      return INITIAL_TAGGED_POSTS;
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
      localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(likedIds));
    } catch (e) {
      console.warn('Failed to persist likes', e);
    }
  }, [likedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REPOSTS, JSON.stringify(repostedIds));
    } catch (e) {
      console.warn('Failed to persist reposts', e);
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
      localStorage.setItem(STORAGE_KEY_POLL_VOTES, JSON.stringify(pollVotes));
    } catch (e) {
      console.warn('Failed to persist poll votes', e);
    }
  }, [pollVotes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOCAL_POSTS, JSON.stringify(posts));
    } catch (e) {
      console.warn('Failed to persist custom posts', e);
    }
  }, [posts]);

  const isTagged = useCallback((userId: string) => taggedIds.includes(userId), [taggedIds]);

  const toggleTag = useCallback((user: User) => {
    let nowTagged = false;
    setTaggedIds((prev) => {
      if (prev.includes(user.id)) {
        nowTagged = false;
        toast.info(`Left ${user.display_name}'s world`);
        return prev.filter((id) => id !== user.id);
      } else {
        nowTagged = true;
        toast.success(`Tagged along with ${user.display_name}! You will see their world in your feed.`);
        return [...prev, user.id];
      }
    });
    return nowTagged;
  }, []);

  const tagUser = useCallback((user: User) => {
    setTaggedIds((prev) => {
      if (prev.includes(user.id)) return prev;
      toast.success(`Tagged along with ${user.display_name}!`);
      return [...prev, user.id];
    });
  }, []);

  const untagUser = useCallback((userId: string) => {
    setTaggedIds((prev) => prev.filter((id) => id !== userId));
  }, []);

  const toggleLike = useCallback((postId: string) => {
    let nowLiked = false;
    setLikedIds((prev) => {
      if (prev.includes(postId)) {
        nowLiked = false;
        return prev.filter((id) => id !== postId);
      } else {
        nowLiked = true;
        return [...prev, postId];
      }
    });
    return nowLiked;
  }, []);

  const toggleRepost = useCallback((postId: string) => {
    let nowReposted = false;
    setRepostedIds((prev) => {
      if (prev.includes(postId)) {
        nowReposted = false;
        toast.info('Removed Rescrut');
        return prev.filter((id) => id !== postId);
      } else {
        nowReposted = true;
        toast.success('Rescrutted to your world!');
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
        toast.info('Removed from saved posts');
        return prev.filter((id) => id !== postId);
      } else {
        nowBookmarked = true;
        toast.success('Saved to your bookmarks');
        return [...prev, postId];
      }
    });
    return nowBookmarked;
  }, []);

  const getUserPollVote = useCallback(
    (postId: string) => pollVotes[postId],
    [pollVotes]
  );

  const votePoll = useCallback(
    (postId: string, optionId: string) => {
      const prevVoted = pollVotes[postId];
      if (prevVoted === optionId) {
        // User clicked same option, do nothing or keep as voted
        return;
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId || !post.poll) return post;

          let chosenOptionText = '';
          const updatedOptions = post.poll.options.map((opt) => {
            let votes = opt.votes;
            if (opt.id === prevVoted) {
              votes = Math.max(0, votes - 1);
            }
            if (opt.id === optionId) {
              votes += 1;
              chosenOptionText = opt.text;
            }
            return { ...opt, votes };
          });

          const totalVotes = updatedOptions.reduce((sum, o) => sum + o.votes, 0);

          if (chosenOptionText) {
            toast.success(`Vote counted for "${chosenOptionText}"!`);
          }

          return {
            ...post,
            poll: {
              ...post.poll,
              options: updatedOptions,
              total_votes: totalVotes,
              user_voted_option_id: optionId,
            },
          };
        })
      );

      setPollVotes((prev) => ({
        ...prev,
        [postId]: optionId,
      }));
    },
    [pollVotes]
  );

  const addPost = useCallback((payload: NewTaggedPostPayload) => {
    const newPost: TaggedPostItem = {
      id: `tagpost-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user: payload.user,
      text: payload.text,
      image_url: payload.image_url,
      gif_url: payload.gif_url,
      sticker: payload.sticker,
      poll: payload.poll,
      location_tag: payload.location_tag,
      mood_tag: payload.mood_tag,
      created_at: new Date().toISOString(),
      like_count: 0,
      retag_count: 0,
      reply_count: 0,
      replies: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    toast.success('Glimpse shared to Tagged!');
    return newPost;
  }, []);

  const addReply = useCallback((postId: string, user: User, text: string, sticker?: TaggedSticker) => {
    const newReply: TaggedReply = {
      id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user,
      text,
      sticker,
      created_at: new Date().toISOString(),
      likes: 0,
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const currentReplies = p.replies || [];
          return {
            ...p,
            reply_count: (p.reply_count || currentReplies.length) + 1,
            replies: [...currentReplies, newReply],
          };
        }
        return p;
      })
    );
    toast.success('Reply posted!');
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
        likedIds,
        toggleLike,
        repostedIds,
        toggleRepost,
        bookmarkedIds,
        toggleBookmark,
        pollVotes,
        votePoll,
        getUserPollVote,
        posts,
        addPost,
        addReply,
        getTaggedUsersList,
        allKnownUsers: MOCK_USERS,
        stickerPack: STICKER_PACK,
        curatedGifs: CURATED_GIFS,
        photoPresets: PHOTO_PRESETS,
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
