import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (input, init) => fetch(input, init),
  },
});

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          display_name: string | null;
          date_of_birth: string | null;
          country: string | null;
          city: string | null;
          bio: string | null;
          avatar_url: string | null;
          is_admin: boolean;
          website: string | null;
          twitter: string | null;
          instagram: string | null;
          onboarded: boolean;
        };
      };
    };
  };
};
