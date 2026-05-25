import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type SocialProvider = 'kakao' | 'google';

/**
 * Start a social login. Uses Supabase Auth's OAuth flow, which handles the
 * full redirect dance and session — no client secrets in the browser.
 * Requires the Supabase project + the provider configured in its dashboard.
 */
export async function loginWithProvider(provider: SocialProvider): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      '소셜 로그인은 백엔드(Supabase) 연결 후 사용할 수 있어요. 우선 "게스트로 둘러보기"로 시작해보세요.',
    );
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  });
  // On success the browser redirects to the provider; the session is picked
  // up on return by initAuth()'s onAuthStateChange listener.
  if (error) throw new Error(error.message);
}

/**
 * Passwordless email login (magic link). Works with Supabase's built-in email
 * provider — no OAuth app needed. The user clicks the link in their inbox and
 * is returned signed in.
 */
export async function loginWithEmail(email: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('백엔드(Supabase) 연결 후 사용할 수 있어요.');
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw new Error(error.message);
}
