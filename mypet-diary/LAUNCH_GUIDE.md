# 실사용 가이드 — DB 연동 + 실제 폰에서 사용하기

## 큰 그림

| 항목 | 현재 상태 | 필요 작업 |
|------|-----------|-----------|
| 로그인(카카오/구글) | 코드 완성 | **Supabase 연결만** 하면 동작 |
| 데이터 저장 | 기기 로컬(localStorage) | 클라우드 동기화는 다음 단계(개발 필요) |
| 실제 폰 사용 | 가능 (PWA) | 웹 배포 후 홈 화면 추가 |
| 네이티브 iOS 빌드 | 보류 | Xcode iOS 26.5 플랫폼 설치 마무리 후 |

> 단일 기기에서 "로그인 → 펫 등록 → 기록"은 아래 STEP 1~3만 하면 **오늘 바로** 됩니다.

---

## STEP 1 — Supabase 연결 (로그인 + 백엔드)

1. **프로젝트 생성**: https://supabase.com → New project (지역: Northeast Asia(Seoul) 권장)
2. **스키마 적용**: 좌측 **SQL Editor** → `mypet-diary/supabase/schema.sql` 내용 붙여넣고 **Run** (테이블 + 보안정책 생성)
3. **키 복사**: **Project Settings → API** →
   - `Project URL`
   - `anon public` 키
   → `mypet-diary/.env` 에 추가:
   ```
   VITE_SUPABASE_URL=https://<프로젝트>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon public key>
   ```
4. **소셜 로그인 켜기**: **Authentication → Providers**

   **Google**
   - https://console.cloud.google.com → 프로젝트 생성 → "OAuth 동의 화면" 구성
   - "사용자 인증 정보 → OAuth 클라이언트 ID(웹 애플리케이션)" 생성
   - **승인된 리디렉션 URI**에 추가: `https://<프로젝트>.supabase.co/auth/v1/callback`
   - 발급된 Client ID / Secret 을 Supabase Google provider에 입력

   **Kakao**
   - https://developers.kakao.com → 애플리케이션 추가
   - 카카오 로그인 활성화 → **Redirect URI**: `https://<프로젝트>.supabase.co/auth/v1/callback`
   - REST API 키 + (보안) Client Secret 을 Supabase Kakao provider에 입력
   - 동의항목에서 닉네임/이메일 허용

5. **Authentication → URL Configuration → Redirect URLs** 에 실제 사용할 주소 추가
   (개발: `http://localhost:5173`, 배포: 아래 STEP 2의 Vercel 주소)

→ dev 서버 재시작하면 로그인 화면의 **카카오/구글 버튼이 실제로 동작**합니다.

---

## STEP 2 — 웹 배포 (폰에서 쓰려면 필요)

폰에서 쓰고 OAuth 리디렉션이 되려면 공개 주소가 필요해요. **Vercel(무료)** 추천:

1. https://vercel.com → GitHub로 로그인 → **Add New → Project** → 이 저장소 선택
2. 설정:
   - **Root Directory**: `mypet-diary`
   - **Framework Preset**: Vite (자동 인식)
   - **Environment Variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 입력
3. **Deploy** → `https://여러분-앱.vercel.app` 주소 발급
4. 그 주소를 **Supabase Redirect URLs** 와 **Google/Kakao Redirect URI** 에도 추가

> HTTPS라 위치/카메라 권한, PWA 설치가 정상 동작해요.

---

## STEP 3 — 아이폰에 설치해서 사용 (PWA, 지금 바로 가능)

App Store 없이 홈 화면 앱처럼 쓸 수 있어요:

1. 아이폰 **Safari**로 STEP 2의 배포 주소 접속
2. 로그인 (카카오/구글/게스트)
3. 하단 **공유 버튼** → **"홈 화면에 추가"**
4. 홈 화면에 **마이펫 다이어리** 아이콘 생성 → 전체화면 앱으로 실행 (PWA 매니페스트·아이콘 적용됨)

이러면 **실제 폰에서 로그인하고 펫 등록·케어·산책 GPS·사진첩까지** 사용할 수 있어요.

---

## (옵션) 네이티브 iOS / 앱스토어

현재 Xcode 26.5의 iOS 26.5 플랫폼 설치가 마무리되지 않아 시뮬레이터/네이티브 빌드가 막혀 있어요.
- 해결: Xcode → Settings → Components 에서 iOS 26.5 설치 마무리, 또는 맥 재부팅
- 그 후 실기기 설치: 무료 Apple ID로 7일 테스트, 또는 Apple Developer($99/년) + TestFlight
- 자세한 절차는 `DEPLOY.md` 참고

## (옵션) AI 캐릭터 프로덕션

`vite.character-proxy.ts`는 개발 서버 전용이라, 배포본에선 AI 캐릭터가 동작하지 않아요.
Supabase Edge Function 또는 Vercel Function으로 옮기면 됩니다 (`AI_CHARACTER.md` 참고).
로그인·기록 등 핵심 기능은 이것 없이도 정상 동작해요.

---

## 다음 개발 단계 (Supabase 연결 후 제가 진행)

- **클라우드 동기화**: 로그인 시 펫/기록을 Supabase에 저장·동기화 (기기 변경/다중 기기 지원)
- 사진을 Supabase Storage로 이전 (localStorage 용량 한계 해소)

→ STEP 1을 마치고 `VITE_SUPABASE_URL` / `ANON_KEY` 를 알려주시면, 그 프로젝트에 맞춰 동기화 레이어를 붙이고 실제로 테스트하겠습니다.
