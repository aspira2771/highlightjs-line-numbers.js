import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type AuthProvider = 'kakao' | 'google' | 'guest';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  provider: AuthProvider;
}

interface AuthState {
  user: AuthUser | null;
  /** True once the initial session check has run (avoids a login-screen flash). */
  initialized: boolean;
  loginAsGuest: (name?: string) => void;
  setUser: (user: AuthUser | null) => void;
  setInitialized: (v: boolean) => void;
  logout: () => Promise<void>;
}

function fromSupabase(u: User): AuthUser {
  const meta = (u.user_metadata ?? {}) as Record<string, string | undefined>;
  return {
    id: u.id,
    name: meta.name ?? meta.full_name ?? meta.nickname ?? '회원',
    email: u.email ?? undefined,
    avatarUrl: meta.avatar_url ?? meta.picture ?? undefined,
    provider: (u.app_metadata?.provider as AuthProvider) ?? 'google',
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      initialized: false,
      loginAsGuest: (name) =>
        set({
          user: {
            id: 'guest',
            name: name?.trim() || '게스트',
            provider: 'guest',
          },
        }),
      setUser: (user) => set({ user }),
      setInitialized: (v) => set({ initialized: v }),
      logout: async () => {
        if (isSupabaseConfigured && supabase) {
          await supabase.auth.signOut();
        }
        set({ user: null });
      },
    }),
    { name: 'mypet:auth' },
  ),
);

/**
 * Hydrate the auth state from Supabase (if configured) and keep it in sync.
 * Call once on app start. Guest sessions live entirely in localStorage.
 */
export async function initAuth(): Promise<void> {
  const { setUser, setInitialized } = useAuthStore.getState();
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) setUser(fromSupabase(data.session.user));

    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(fromSupabase(session.user));
      } else if (event === 'SIGNED_OUT') {
        const current = useAuthStore.getState().user;
        // Don't wipe a local guest session on Supabase's null events.
        if (current && current.provider !== 'guest') setUser(null);
      }
    });
  }
  setInitialized(true);
}
