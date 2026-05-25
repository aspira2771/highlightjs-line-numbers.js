import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase powers the backend: Postgres data, auth (Google/Kakao OAuth), and
 * storage. It is OPTIONAL at runtime — when the env vars are absent the app
 * still works fully in local (guest) mode against localStorage. Configure it
 * to enable real accounts and cloud sync.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
