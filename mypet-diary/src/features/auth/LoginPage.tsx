import { useState } from 'react';
import { PawPrint } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { loginWithProvider, type SocialProvider } from './providers';

/** Kakao speech-bubble mark. */
function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3C6.477 3 2 6.463 2 10.733c0 2.74 1.86 5.146 4.667 6.5-.154.54-.99 3.41-1.02 3.64 0 0-.02.17.09.235a.31.31 0 0 0 .263.013c.33-.046 3.83-2.5 4.435-2.925.51.072 1.03.11 1.565.11 5.523 0 10-3.463 10-7.733S17.523 3 12 3Z" />
    </svg>
  );
}

/** Google multi-color G. */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z" />
      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44Z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z" />
    </svg>
  );
}

export function LoginPage() {
  const loginAsGuest = useAuthStore((s) => s.loginAsGuest);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<SocialProvider | null>(null);

  const social = async (provider: SocialProvider) => {
    setError(null);
    setBusy(provider);
    try {
      await loginWithProvider(provider);
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그인에 실패했어요.');
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto flex h-full min-h-screen max-w-md flex-col bg-surface px-6">
      {/* Brand / hero */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-card bg-primary text-white shadow-soft">
          <PawPrint size={44} strokeWidth={1.8} />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold text-ink">마이펫 다이어리</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
          내 반려동물이 직접 알려주는
          <br />
          감성 펫 케어 다이어리
        </p>
      </div>

      {/* CTAs */}
      <div className="space-y-2.5 pb-10">
        {error && (
          <p className="mb-1 rounded-soft bg-primary-50 p-3 text-center text-xs text-primary-500">
            {error}
          </p>
        )}

        <button
          onClick={() => social('kakao')}
          disabled={busy !== null}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-soft bg-[#FEE500] text-[15px] font-bold text-[#191600] transition active:scale-[0.99] disabled:opacity-60"
        >
          <KakaoIcon />
          {busy === 'kakao' ? '연결 중…' : '카카오로 시작하기'}
        </button>

        <button
          onClick={() => social('google')}
          disabled={busy !== null}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-soft border border-line bg-surface text-[15px] font-bold text-gray-800 transition active:scale-[0.99] disabled:opacity-60"
        >
          <GoogleIcon />
          {busy === 'google' ? '연결 중…' : 'Google로 시작하기'}
        </button>

        <button
          onClick={() => loginAsGuest()}
          disabled={busy !== null}
          className="h-12 w-full text-sm font-semibold text-gray-500 transition active:scale-[0.99]"
        >
          게스트로 둘러보기
        </button>

        <p className="px-2 pt-1 text-center text-[11px] leading-relaxed text-gray-400">
          로그인하면 서비스 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주돼요.
        </p>
      </div>
    </div>
  );
}
