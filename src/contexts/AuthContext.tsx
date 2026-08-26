import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  country?: string;
  city?: string;
  bio?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  is_admin: boolean;
  onboarded: boolean;
  date_of_birth?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (u: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(supabaseUser: SupabaseUser, profile?: Record<string, unknown>): AuthUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    display_name:
      (profile?.display_name as string) ||
      supabaseUser.user_metadata?.display_name ||
      supabaseUser.email!.split('@')[0],
    avatar_url: (profile?.avatar_url as string) || supabaseUser.user_metadata?.avatar_url,
    country: profile?.country as string | undefined,
    city: profile?.city as string | undefined,
    bio: profile?.bio as string | undefined,
    website: profile?.website as string | undefined,
    twitter: profile?.twitter as string | undefined,
    instagram: profile?.instagram as string | undefined,
    is_admin: (profile?.is_admin as boolean) || false,
    onboarded: (profile?.onboarded as boolean) || false,
    date_of_birth: profile?.date_of_birth as string | undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<AuthUser> => {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();
    return mapUser(supabaseUser, profile ?? {});
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { user: su } } = await supabase.auth.getUser();
    if (su) {
      const authUser = await fetchProfile(su);
      setUser(authUser);
    }
  }, [fetchProfile]);

  const login = useCallback((u: AuthUser) => setUser(u), []);
  const logout = useCallback(() => setUser(null), []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const authUser = await fetchProfile(session.user);
        if (mounted) setUser(authUser);
      }
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const authUser = await fetchProfile(session.user);
        if (mounted) {
          setUser(authUser);
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
